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

    try {
      // Emit 0% progress immediately to signal job has started
      this.gateway.emitProgress(jobId, 0);
      console.log('[Processor] 📡 Emitted initial 0% progress');

      // Small delay to ensure frontend WebSocket connection is established
      await new Promise(resolve => setTimeout(resolve, 500));

      let processed = 0;
      const batch: any[] = [];
      const BATCH_SIZE = 50; // Reduced for low-RAM environments
      let lastProgressEmit = Date.now();
      const PROGRESS_EMIT_INTERVAL = 1000; // Emit progress max every 1 second

      console.log('[Processor] 🔄 Starting single-pass processing...');

      return new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(path)
          .pipe(parse({ headers: true, skipRows: 0 }));

        stream.on('data', async (row) => {
          // Pause stream to handle backpressure
          stream.pause();

          try {
            batch.push({
              name: row.name,
              age: Number(row.age),
              position: row.position,
              salary: Number(row.salary),
            });

            // Insert batch when it reaches BATCH_SIZE
            if (batch.length >= BATCH_SIZE) {
              await this.employeeService.batchInsert([...batch]);
              processed += batch.length;
              batch.length = 0;

              // Emit progress (throttled to avoid overwhelming WebSocket)
              const now = Date.now();
              if (now - lastProgressEmit >= PROGRESS_EMIT_INTERVAL) {
                // Estimate progress (we don't know total, so show incremental)
                console.log('[Processor] 📈 Processed:', processed, 'rows');
                this.gateway.emitProgress(jobId, Math.min(95, processed)); // Cap at 95% until completion
                lastProgressEmit = now;
              }

              // Force garbage collection hint for low-RAM environments
              if (global.gc && processed % 500 === 0) {
                global.gc();
              }
            }

            // Resume stream
            stream.resume();
          } catch (error) {
            console.error('[Processor] ❌ Error during batch insert:', error);
            this.gateway.emitError(jobId, 'Database error during import');
            stream.destroy();
            reject(error);
          }
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
            try {
              if (fs.existsSync(path)) {
                fs.unlinkSync(path);
                console.log('[Processor] 🗑️ Cleaned up temp file');
              }
            } catch (unlinkError) {
              console.warn('[Processor] ⚠️ Could not delete temp file:', unlinkError);
            }

            resolve();
          } catch (error) {
            console.error('[Processor] ❌ Error during final processing:', error);
            this.gateway.emitError(jobId, 'Failed to complete import');
            reject(error);
          }
        });

        stream.on('error', (error) => {
          console.error('[Processor] ❌ Stream error:', error);
          this.gateway.emitError(jobId, 'File processing error');

          // Attempt cleanup on error
          try {
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          } catch (unlinkError) {
            console.warn('[Processor] ⚠️ Could not delete temp file after error');
          }

          reject(error);
        });
      });
    } catch (error) {
      console.error('[Processor] ❌ Unexpected error:', error);
      this.gateway.emitError(jobId, 'Import failed unexpectedly');

      // Cleanup on any error
      try {
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      } catch (unlinkError) {
        console.warn('[Processor] ⚠️ Could not delete temp file');
      }

      throw error;
    }
  }
}
