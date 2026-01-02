import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue('employeeNotifications') private readonly queue: Queue) {}

  async sendNewEmployeeNotification(employeeId: string, name: string) {
    await this.queue.add('newEmployee', { employeeId, name });
  }
}
