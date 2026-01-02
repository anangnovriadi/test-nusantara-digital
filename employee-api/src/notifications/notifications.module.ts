import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'employeeNotifications',
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  providers: [NotificationsService, NotificationsProcessor, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
