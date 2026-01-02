import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsGateway } from './notifications.gateway';

@Processor('employeeNotifications')
export class NotificationsProcessor {
  constructor(private readonly gateway: NotificationsGateway) {}

  @Process('newEmployee')
  async handleNewEmployee(job: Job) {
    const { employeeId, name } = job.data;
    await new Promise(res => setTimeout(res, 2000));

    this.gateway.sendNotification({
      type: 'newEmployee',
      message: `Data karyawan "${name}" berhasil ditambahkan`,
      employeeId,
    });
  }
}
