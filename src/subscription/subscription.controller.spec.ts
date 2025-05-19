import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { EmailService } from './../email/email.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';

const repoMock = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});
const emailMock = () => ({
  sendConfirmation: jest.fn(),
});
const serviceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
});

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        { provide: SubscriptionService, useFactory: serviceMock },
        { provide: getRepositoryToken(Subscription), useFactory: repoMock },
        { provide: EmailService, useFactory: emailMock },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
