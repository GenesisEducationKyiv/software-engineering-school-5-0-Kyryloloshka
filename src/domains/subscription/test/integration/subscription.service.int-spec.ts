import { AppModule } from 'src/app.module';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { SubscriptionService } from '../../subscription.service';
import { Subscription } from '../../entities/subscription.entity';
import { EmailService } from 'src/domains/email/email.service';
import { CreateSubscriptionDto } from '../../dto/create-subscription.dto';

class MockEmailService {
  async sendConfirmationEmail() {
    return;
  }
  async sendUnsubscribeEmail() {
    return;
  }
}

describe('SubscriptionService Int', () => {
  let dataSource: DataSource;
  let service: SubscriptionService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(new MockEmailService())
      .compile();

    dataSource = moduleRef.get(DataSource);
    service = moduleRef.get(SubscriptionService);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "subscription" RESTART IDENTITY CASCADE;',
    );
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
