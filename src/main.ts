import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RpcException, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { protobufPackage } from './category/pb/category.pb';
import { status } from '@grpc/grpc-js';

async function bootstrap() {
  const app: INestMicroservice = await NestFactory.createMicroservice(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50054',
        package: protobufPackage,
        protoPath: join('node_modules/e-shop-nest-proto/proto/category.proto'),
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      disableErrorMessages: true,
      exceptionFactory: (errors) => {
        const errorsList: string[] = [];
        errors.forEach((x) => {
          const errValidation = x.constraints;
          for (const err in errValidation) {
            errorsList.push(errValidation[err]);
          }
        });
        return new RpcException({
          code: status.INVALID_ARGUMENT,
          message: errorsList,
        });
      },
    }),
  );

  await app.listen();
}

bootstrap();
