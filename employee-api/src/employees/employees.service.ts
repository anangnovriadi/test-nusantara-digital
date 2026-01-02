import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
    private readonly notifications: NotificationsService
  ) {}

  async create(data: CreateEmployeeDto) {
    const employee = await this.repo.save(data);

    await this.notifications.sendNewEmployeeNotification(employee.id, employee.name);

    return employee;
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  update(id: string, data: Partial<Employee>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async batchInsert(data: Partial<Employee>[]) {
    await this.repo.save(data);
  }
}
