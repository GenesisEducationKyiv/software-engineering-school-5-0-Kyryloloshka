import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';

const repoMock = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});
const serviceMock = () => ({
  subscribe: jest.fn(),
  confirmSubscription: jest.fn(),
  unsubscribe: jest.fn(),
});

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: ReturnType<typeof serviceMock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        { provide: 'ISubscriptionService', useFactory: serviceMock },
        { provide: getRepositoryToken(Subscription), useFactory: repoMock },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    service = module.get('ISubscriptionService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribe', () => {
    it('should call service.subscribe and return message and token', async () => {
      service.subscribe.mockResolvedValueOnce({ token: 'sometoken' });
      const dto = { email: 'test@mail.com', city: 'Kyiv', frequency: 'daily' };
      const result = await controller.subscribe(dto as any);
      expect(service.subscribe).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        message: 'Subscription successful. Confirmation email sent.',
        token: 'sometoken',
      });
    });
  });

  describe('confirm', () => {
    it('should call service.confirmSubscription and return success message', async () => {
      service.confirmSubscription.mockResolvedValueOnce(undefined);
      const result = await controller.confirmSubscription({
        token: 'sometoken',
      });
      expect(service.confirmSubscription).toHaveBeenCalledWith({
        token: 'sometoken',
      });
      expect(result).toEqual({
        message: 'Subscription confirmed successfully',
      });
    });
  });

  describe('unsubscribe', () => {
    it('should call service.unsubscribe and return success message', async () => {
      service.unsubscribe.mockResolvedValueOnce(undefined);
      const result = await controller.unsubscribe({ token: 'sometoken' });
      expect(service.unsubscribe).toHaveBeenCalledWith({ token: 'sometoken' });
      expect(result).toEqual({ message: 'Successfully unsubscribed' });
    });
  });
});
