import { AppModule } from 'src/app.module';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';

describe('SubscriptionService Int', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleRef.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "subscription" RESTART IDENTITY CASCADE;',
    );
  });

  it.todo('should pass');
});
