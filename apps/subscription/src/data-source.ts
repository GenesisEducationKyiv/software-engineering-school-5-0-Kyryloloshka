import { Subscription } from './modules/subscription/entities/subscription.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({
  path: 'apps/subscription/.env',
});

export const dbConfig = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Subscription],
  migrations: ['apps/subscription/src/migrations/*.ts'],
};

console.log(dbConfig);

export default new DataSource(dbConfig as DataSourceOptions);
