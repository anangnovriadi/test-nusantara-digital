import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EmployeesService } from './employees.service';
import * as fs from 'fs';
import { parse } from 'fast-csv';
import { EmployeeGateway } from './employees.gateway';

@Processor('importEmployee')
export class EmployeeProcessor {
  constructor(
    private readonly employeeService: EmployeesService,
    private readonly gateway: EmployeeGateway,
  ) { }

  @Process('import')
  async handleImport(job: Job<{ path: string; jobId: string }>) {
    const { path, jobId } = job.data;

    console.log('[Processor] 🚀 Starting import job:', jobId);
    console.log('[Processor] File path:', path);

    // Emit 0% progress immediately to signal job has started
    this.gateway.emitProgress(jobId, 0);
    console.log('[Processor] 📡 Emitted initial 0% progress');

    // Small delay to ensure frontend WebSocket connection is established
    await new Promise(resolve => setTimeout(resolve, 500));

    let totalRows = 0;
    let processed = 0;
    const batch: any[] = [];
    const BATCH_SIZE = 100;

    // First pass: count total rows for accurate progress
    console.log('[Processor] 📊 Counting total rows...');
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(parse({ headers: true, skipRows: 0 }))
        .on('data', () => totalRows++)
        .on('end', () => {
          console.log('[Processor] ✅ Total rows counted:', totalRows);
          resolve();
        })
        .on('error', (error) => {
          console.error('[Processor] ❌ Error counting rows:', error);
          reject(error);
        });
    });

    // Second pass: process and insert data
    console.log('[Processor] 🔄 Starting data processing...');
    return new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(path)
        .pipe(parse({ headers: true, skipRows: 0 }));

      stream.on('data', async (row) => {
        // Pause stream to handle backpressure
        stream.pause();

        batch.push({
          name: row.name,
          age: Number(row.age),
          position: row.position,
          salary: Number(row.salary),
        });

        // Insert batch when it reaches BATCH_SIZE
        if (batch.length >= BATCH_SIZE) {
          try {
            await this.employeeService.batchInsert([...batch]);
            processed += batch.length;
            batch.length = 0;

            // Emit progress
            const progress = Math.min(100, Math.floor((processed / totalRows) * 100));
            console.log('[Processor] 📈 Progress:', progress, '% (', processed, '/', totalRows, ')');
            this.gateway.emitProgress(jobId, progress);
          } catch (error) {
            console.error('[Processor] ❌ Error during batch insert:', error);
            stream.destroy();
            reject(error);
            return;
          }
        }

        // Resume stream
        stream.resume();
      });

      stream.on('end', async () => {
        try {
          // Insert remaining rows
          if (batch.length > 0) {
            console.log('[Processor] 📦 Inserting remaining', batch.length, 'rows');
            await this.employeeService.batchInsert(batch);
            processed += batch.length;
          }

          // Emit 100% completion
          console.log('[Processor] ✅ Import complete! Total processed:', processed);
          this.gateway.emitProgress(jobId, 100);

          // Emit completion event with total processed
          this.gateway.emitCompletion(jobId, processed);

          // Clean up temp file
          fs.unlinkSync(path);
          console.log('[Processor] 🗑️ Cleaned up temp file');
          resolve();
        } catch (error) {
          console.error('[Processor] ❌ Error during final processing:', error);
          reject(error);
        }
      });

      stream.on('error', (error) => {
        console.error('[Processor] ❌ Stream error:', error);
        reject(error);
      });
    });
  }
}
