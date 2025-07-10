import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CreateSubscriptionDto } from '../../dto/create-subscription.dto';
import { Subscription } from '../../entities/subscription.entity';
import { INestApplication } from '@nestjs/common';
import { IEmailService } from '../../../../modules/email/interfaces/email-service.interface';
import { ISubscriptionService } from '../../interfaces/subscription-service.interface';
import { AppModule } from '../../../app.module';
import { server } from '@lib/common/mock/server';

jest.mock('@nestjs-modules/mailer/dist/adapters/handlebars.adapter', () => ({
  HandlebarsAdapter: jest.fn(),
}));

class MockEmailService implements IEmailService {
  async sendConfirmationEmail() {
    return;
  }
  async sendWeatherUpdate() {
    return;
  }
}

describe('SubscriptionService Int', () => {
  let dataSource: DataSource;
  let service: ISubscriptionService;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('IEmailService')
      .useValue(new MockEmailService())
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    dataSource = moduleRef.get(DataSource);
    service = moduleRef.get('ISubscriptionService');
    server.listen();
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "subscription" RESTART IDENTITY CASCADE;',
    );
  });

  afterEach(() => server.resetHandlers());

  afterAll(async () => {
    await app.close();
    jest.resetAllMocks();
    server.close();
  });

  it('should create a new subscription and send confirmation', async () => {
    const dto: CreateSubscriptionDto = {
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: 'daily',
    };
    const { token } = await service.subscribe(dto);

    const repo = dataSource.getRepository(Subscription);
    const sub = await repo.findOne({ where: { email: dto.email } });

    expect(sub).toBeDefined();
    expect(sub?.confirmed).toBe(false);
    expect(typeof token).toBe('string');
  });

  it('should confirm subscription', async () => {
    const dto: CreateSubscriptionDto = {
      email: 'test2@mail.com',
      city: 'Lviv',
      frequency: 'daily',
    };
    const { token } = await service.subscribe(dto);

    await service.confirmSubscription(token);

    const repo = dataSource.getRepository(Subscription);
    const sub = await repo.findOne({ where: { email: dto.email } });

    expect(sub?.confirmed).toBe(true);
  });

  it('should unsubscribe and remove subscription', async () => {
    const dto: CreateSubscriptionDto = {
      email: 'test3@mail.com',
      city: 'Odesa',
      frequency: 'daily',
    };
    const { token } = await service.subscribe(dto);

    await service.confirmSubscription(token);

    await service.unsubscribe(token);

    const repo = dataSource.getRepository(Subscription);
    const sub = await repo.findOne({ where: { email: dto.email } });

    expect(sub).toBeNull();
  });

  it('should find confirmed subscriptions by frequency 2', async () => {
    const dto1: CreateSubscriptionDto = {
      email: 'd@mail.com',
      city: 'Kyiv',
      frequency: 'daily',
    };
    const dto2: CreateSubscriptionDto = {
      email: 'e@mail.com',
      city: 'Lviv',
      frequency: 'daily',
    };
    const { token: token1 } = await service.subscribe(dto1);
    const { token: token2 } = await service.subscribe(dto2);

    await service.confirmSubscription(token1);
    await service.confirmSubscription(token2);

    const confirmed = await service.findConfirmedByFrequency('daily');

    expect(confirmed.length).toBe(2);
    expect(confirmed.every((s: Subscription) => s.confirmed)).toBe(true);
  });
});
