import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should create employee', async () => {
    mockService.create.mockResolvedValue({ id: 'uuid' });

    const result = await controller.create({
      name: 'Aex',
      age: 30,
      position: 'Manager',
      salary: 15000000,
    });

    expect(result).toEqual({ id: 'uuid' });
  });

  it('should return all employees', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1' }]);

    const result = await controller.findAll();

    expect(result).toEqual([{ id: '1' }]);
  });

  it('should return employee by id', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(result).toEqual({ id: '1' });
  });

  it('should update employee', async () => {
    mockService.update.mockResolvedValue({ affected: 1 });

    const result = await controller.update('1', { position: 'Sales' });

    expect(result).toEqual({ affected: 1 });
  });

  it('should delete employee', async () => {
    mockService.remove.mockResolvedValue({ affected: 1 });

    const result = await controller.remove('1');

    expect(result).toEqual({ affected: 1 });
  });
});
