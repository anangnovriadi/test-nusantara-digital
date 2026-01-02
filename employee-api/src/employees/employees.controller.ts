import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bull';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Queue } from 'bull';
import { v4 as uuid } from 'uuid';

@ApiTags('Employees')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly service: EmployeesService,
    @InjectQueue('importEmployee') private importQueue: Queue
  ) { }

  @Post()
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({
    status: 201,
    description: 'Employee successfully created',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'Alex Santoso',
          age: 30,
          position: 'Sales Executive',
          salary: '15000000.00',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
      },
    },
  })
  async create(@Body() body: CreateEmployeeDto) {
    const employee = await this.service.create(body);
    return { data: employee };
  }

  @Get('stats')
  @ApiResponse({
    status: 200,
    description: 'Retrieve employee statistics',
    schema: {
      example: {
        data: {
          totalEmployees: 100,
          positions: ['Software Engineer', 'Sales Executive', 'Manager'],
        },
      },
    },
  })
  async getStats() {
    const stats = await this.service.getStats();
    return { data: stats };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieve employee list',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'Alex Santoso',
            age: 30,
            position: 'Sales Executive',
            salary: '15000000.00',
          },
        ],
        total: 1
      },
    },
  })
  async findAll() {
    const employees = await this.service.findAll();
    return {
      data: employees,
      total: employees.length,
    };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve employee detail',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'Alex Santoso',
          age: 30,
          position: 'Sales Executive',
          salary: '15000000.00',
        },
      },
    },
  })
  async findOne(@Param('id') id: string) {
    const employee = await this.service.findOne(id);
    return { data: employee };
  }

  @Put(':id')
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({
    status: 200,
    description: 'Employee successfully updated',
    schema: {
      example: { data: { message: 'Employee updated successfully' } },
    },
  })
  async update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
    await this.service.update(id, body);
    return { data: { message: 'Employee updated successfully' } };
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Employee successfully deleted',
    schema: {
      example: { data: { message: 'Employee deleted successfully' } },
    },
  })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { data: { message: 'Employee deleted successfully' } };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    description: 'CSV import job created',
    schema: {
      example: {
        jobId: 'uuid',
        message: 'File diterima, sedang diproses...',
      },
    },
  })
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    console.log('[Controller] 📁 CSV import request received');
    console.log('[Controller] File size:', file.size, 'bytes');

    const jobId = uuid();
    const path = `/tmp/${jobId}.csv`;

    console.log('[Controller] Generated jobId:', jobId);
    console.log('[Controller] Temp file path:', path);

    // Stream file to disk instead of loading entire buffer to RAM
    const fs = require('fs');
    const writeStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      writeStream.on('finish', async () => {
        console.log('[Controller] ✅ File written to disk');
        console.log('[Controller] 📋 Creating job in Redis Queue...');

        await this.importQueue.add('import', { path, jobId });

        console.log('[Controller] ✅ Job created successfully');
        resolve({ jobId, message: 'File diterima, sedang diproses...' });
      });

      writeStream.on('error', (err) => {
        console.error('[Controller] ❌ Error writing file:', err);
        reject(err);
      });

      writeStream.write(file.buffer);
      writeStream.end();
    });
  }
}
