import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('EmployeesService', () => {
  let service: EmployeesService;

  const mockRepo = {
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockNotificationsService = {
    sendNewEmployeeNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepo,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should create an employee', async () => {
    mockRepo.save.mockResolvedValue({ id: 'uuid' });

    const result = await service.create({
      name: 'Alex',
      age: 30,
      position: 'Sales Manager',
      salary: 15000000,
    });

    expect(mockRepo.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 'uuid' });
  });

  it('should return all employees', async () => {
    mockRepo.find.mockResolvedValue([{ id: '1' }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: '1' }]);
  });

  it('should return employee by id', async () => {
    mockRepo.findOneBy.mockResolvedValue({ id: '1' });

    const result = await service.findOne('1');

    expect(result).toEqual({ id: '1' });
  });

  it('should update employee', async () => {
    mockRepo.update.mockResolvedValue({ affected: 1 });

    const result = await service.update('1', { position: 'Sales Executive' });

    expect(result).toEqual({ affected: 1 });
  });

  it('should delete employee', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove('1');

    expect(result).toEqual({ affected: 1 });
  });
});
