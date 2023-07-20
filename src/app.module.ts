import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from './category/category.module';
import { databaseConfig } from './configs/database.config';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), CategoryModule],
})
export class AppModule {}
