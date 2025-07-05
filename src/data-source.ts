import { Subscription } from './modules/subscription/entities/subscription.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test.local' : '.env',
});

export const dbConfig =
  process.env.NODE_ENV === 'test'
    ? {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres-test',
        password: 'postgres-test',
        database: 'test-db',
        entities: [Subscription],
        migrations: ['src/migrations/*.ts'],
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [Subscription],
        migrations: ['src/migrations/*.ts'],
      };

export default new DataSource(dbConfig as DataSourceOptions);
