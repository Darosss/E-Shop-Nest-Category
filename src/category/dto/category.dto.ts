import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  CreateCategoryRequest,
  FindOneCategoryRequest,
  UpdateCategoryRequest,
} from '../pb/category.pb';
import { IsGreaterThanZeroNumberArray } from './validators.helper';

export class FindOneRequestDto implements FindOneCategoryRequest {
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  public readonly id: number;
}

export class CreateCategoryRequestDto implements CreateCategoryRequest {
  @IsString()
  @IsNotEmpty()
  public readonly name: string;

  @IsOptional()
  @IsString()
  public readonly description: string;

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  public readonly parentId?: number;

  @IsOptional()
  @IsArray()
  public readonly subcategoriesIds: number[];

  @IsArray()
  public readonly images: string[];
}

export class UpdateCategoryRequestDto implements UpdateCategoryRequest {
  @IsNumber({ allowInfinity: false, allowNaN: false })
  id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public readonly name?: string;

  @IsOptional()
  @IsString()
  public readonly description?: string;

  @IsOptional()
  @IsArray()
  @IsGreaterThanZeroNumberArray()
  public readonly productsIds: number[];

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  public readonly parentId?: number;

  @IsOptional()
  @IsArray()
  @IsGreaterThanZeroNumberArray()
  public readonly subcategoriesIds: number[];

  @IsOptional()
  @IsArray()
  public readonly images: string[];
}
