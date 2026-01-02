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
    }),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeeProcessor, EmployeeGateway],
})
export class EmployeesModule { }
