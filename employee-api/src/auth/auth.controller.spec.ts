import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should login successfully', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: 'mock-token',
    });

    const result = await controller.login({
      email: 'admin@mail.com',
      password: 'Admin123@',
    });

    expect(result).toEqual({
      access_token: 'mock-token',
    });

    expect(service.login).toHaveBeenCalledWith(
      'admin@mail.com',
      'Admin123@',
    );
  });
});
