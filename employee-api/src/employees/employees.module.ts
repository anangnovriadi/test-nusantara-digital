import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee } from './employee.entity';
import { EmployeeProcessor } from './employee.processor';
import { EmployeeGateway } from './employees.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    NotificationsModule,
    BullModule.registerQueue({
      name: 'importEmployee',
      limiter: {
        max: 1,          // Only 1 job at a time
        duration: 1000,  // Per second
      },
      defaultJobOptions: {
        attempts: 3,      // Retry failed jobs 3 times
        backoff: {
          type: 'exponential',
          delay: 2000,    // Start with 2s delay, then 4s, 8s
        },
        removeOnComplete: true,  // Auto-cleanup completed jobs
        removeOnFail: false,     // Keep failed jobs for debugging
      },
    }),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeeProcessor, EmployeeGateway],
})
export class EmployeesModule { }
