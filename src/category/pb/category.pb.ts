/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { ProductsByIdsData } from "./product.pb";

export const protobufPackage = "category";

/** ResponseOperation */
export interface CategoryOperationResponse {
  status: number;
  error: string[];
  id: number;
  message: string;
}

/** CreateCategory */
export interface CreateCategoryRequest {
  name: string;
  description?: string | undefined;
  parentId?: number | undefined;
  subcategoriesIds: number[];
  images: string[];
}

/** UpdateCategory */
export interface UpdateCategoryRequest {
  id: number;
  name?: string | undefined;
  description?: string | undefined;
  parentId?: number | undefined;
  subcategoriesIds: number[];
  images: string[];
  productsIds: number[];
}

export interface FindOneRelatedCategories {
  id: number;
  name: string;
  description?: string | undefined;
  images: string[];
}

export interface FindOneCategoryData {
  id: number;
  name: string;
  description?: string | undefined;
  parentId?: number | undefined;
  subcategories: FindOneRelatedCategories[];
  images: string[];
  parent?:
    | FindOneRelatedCategories
    | undefined;
  /** Vscode shows errors but it's working properly. //.proto */
  products: ProductsByIdsData[];
}

export interface FindOneCategoryRequest {
  id: number;
}

export interface FindOneCategoryResponse {
  status: number;
  error: string[];
  data: FindOneCategoryData | undefined;
}

/** FindAll */
export interface FindManyCategoryData {
  id: number;
  name: string;
  description?: string | undefined;
  parentId?: number | undefined;
  subcategories: FindManyCategoryData[];
  images: string[];
  parent?: FindManyCategoryData | undefined;
}

export interface FindAllCategoriesRequest {
}

export interface FindAllCategoriesResponse {
  status: number;
  error: string[];
  data: FindManyCategoryData[];
}

/** GetCategoriesByIds */
export interface CategoriesByIdsData {
  id: number;
  name: string;
  description?: string | undefined;
  subcategories: number[];
  images: string[];
  parent?: number | undefined;
  products: number[];
}

export interface GetCategoriesByIdsRequest {
  ids: number[];
}

export interface GetCategoriesByIdsResponse {
  status: number;
  error: string[];
  data: CategoriesByIdsData[];
}

export const CATEGORY_PACKAGE_NAME = "category";

export interface CategoryServiceClient {
  createCategory(request: CreateCategoryRequest): Observable<CategoryOperationResponse>;

  updateCategory(request: UpdateCategoryRequest): Observable<CategoryOperationResponse>;

  findOne(request: FindOneCategoryRequest): Observable<FindOneCategoryResponse>;

  findAll(request: FindAllCategoriesRequest): Observable<FindAllCategoriesResponse>;

  getCategoriesByIds(request: GetCategoriesByIdsRequest): Observable<GetCategoriesByIdsResponse>;
}

export interface CategoryServiceController {
  createCategory(
    request: CreateCategoryRequest,
  ): Promise<CategoryOperationResponse> | Observable<CategoryOperationResponse> | CategoryOperationResponse;

  updateCategory(
    request: UpdateCategoryRequest,
  ): Promise<CategoryOperationResponse> | Observable<CategoryOperationResponse> | CategoryOperationResponse;

  findOne(
    request: FindOneCategoryRequest,
  ): Promise<FindOneCategoryResponse> | Observable<FindOneCategoryResponse> | FindOneCategoryResponse;

  findAll(
    request: FindAllCategoriesRequest,
  ): Promise<FindAllCategoriesResponse> | Observable<FindAllCategoriesResponse> | FindAllCategoriesResponse;

  getCategoriesByIds(
    request: GetCategoriesByIdsRequest,
  ): Promise<GetCategoriesByIdsResponse> | Observable<GetCategoriesByIdsResponse> | GetCategoriesByIdsResponse;
}

export function CategoryServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createCategory", "updateCategory", "findOne", "findAll", "getCategoriesByIds"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("CategoryService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("CategoryService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const CATEGORY_SERVICE_NAME = "CategoryService";
