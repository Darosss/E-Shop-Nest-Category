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
  FindOneByCategorySlugRequest,
  FindOneByHeadSlugRequest,
  FindOneBySubHeadSlugRequest,
  FindOneCategoryRequest,
  UpdateCategoryRequest,
} from '../pb/category.pb';
import { IsGreaterThanZeroNumberArray } from './validators.helper';
import { Queries } from '../pb/pagination.pb';

export class FindOneRequestDto implements FindOneCategoryRequest {
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  public readonly id?: number;
}

export class FindOneByHeadSlugRequestDto implements FindOneByHeadSlugRequest {
  @IsOptional()
  @IsString()
  public readonly headSlug?: string;

  @IsOptional()
  productQueries?: Queries;
}
export class FindOneBySubHeadSlugRequestDto
  extends FindOneByHeadSlugRequestDto
  implements FindOneBySubHeadSlugRequest
{
  @IsOptional()
  @IsString()
  public readonly subHeadSlug?: string;
}
export class FindOneByCategorySlugRequestDto
  extends FindOneBySubHeadSlugRequestDto
  implements FindOneByCategorySlugRequest
{
  @IsOptional()
  @IsString()
  public readonly categorySlug?: string;
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
