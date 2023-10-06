import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import {
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
} from './env-variables';

const isDevelopment = NODE_ENV === 'development';

export const databaseConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT, 10),
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  entities: [`${path.dirname(__dirname)}/**/*.entity.{ts,js}`],
  logging: false,
  synchronize: false,
  migrations: [`${path.dirname(__dirname)}/migrations/*{.ts,.js}`],
  migrationsRun: isDevelopment,
};

export const migrationsConfig = new DataSource({
  ...databaseConfig,
});
