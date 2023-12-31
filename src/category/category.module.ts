import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCT_SERVICE_NAME, PRODUCT_PACKAGE_NAME } from './pb/product.pb';
import { PRODUCT_MICROSERVICE_URL } from 'src/configs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PRODUCT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: PRODUCT_MICROSERVICE_URL,
          package: PRODUCT_PACKAGE_NAME,
          protoPath: 'node_modules/e-shop-nest-proto/proto/product.proto',
        },
      },
    ]),
    TypeOrmModule.forFeature([Category]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
