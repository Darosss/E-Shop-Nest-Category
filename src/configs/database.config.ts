import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const isDevelopment = process.env.NODE_ENV === 'development';

export const databaseConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [`${path.dirname(__dirname)}/**/*.entity.{ts,js}`],
  logging: isDevelopment,
  synchronize: false,
  migrations: [`${path.dirname(__dirname)}/migrations/*{.ts,.js}`],
  migrationsRun: isDevelopment,
};

export const migrationsConfig = new DataSource({
  ...databaseConfig,
});
