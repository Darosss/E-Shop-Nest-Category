import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { CategoryService } from './category.service';
import {
  CATEGORY_SERVICE_NAME,
  CategoryOperationResponse,
  FindAllCategoriesResponse,
  FindOneCategoryResponse,
  GetCategoriesByIdsRequest,
  GetCategoriesByIdsResponse,
} from './pb/category.pb';
import {
  CreateCategoryRequestDto,
  FindOneRequestDto,
  UpdateCategoryRequestDto,
} from './dto/category.dto';
import { PRODUCT_SERVICE_NAME } from './pb/product.pb';

@Controller()
export class CategoryController {
  @Inject(CategoryService)
  private readonly service: CategoryService;

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'CreateCategory')
  private createCategory(
    payload: CreateCategoryRequestDto,
  ): Promise<CategoryOperationResponse> {
    return this.service.createCategory(payload);
  }

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'UpdateCategory')
  private updateCategory(
    payload: UpdateCategoryRequestDto,
  ): Promise<CategoryOperationResponse> {
    return this.service.updateCategory(payload);
  }

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'FindOne')
  private findOne(
    payload: FindOneRequestDto,
  ): Promise<FindOneCategoryResponse> {
    return this.service.findOne(payload);
  }

  @GrpcMethod(CATEGORY_SERVICE_NAME, 'FindAll')
  private findAll(): Promise<FindAllCategoriesResponse> {
    return this.service.findAll();
  }

  @GrpcMethod(PRODUCT_SERVICE_NAME, 'GetCategoriesByIds')
  private getCategoriesByIds(
    payload: GetCategoriesByIdsRequest,
  ): Promise<GetCategoriesByIdsResponse> {
    return this.service.getCategoriesByIds(payload.ids);
  }
}
