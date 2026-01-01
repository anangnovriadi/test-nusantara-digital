import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return health status', () => {
    const result = appController.healthCheck();

    expect(result).toMatchObject({
      status: 'ok',
    });

    expect(result.timestamp).toBeInstanceOf(Date);
  });
});
