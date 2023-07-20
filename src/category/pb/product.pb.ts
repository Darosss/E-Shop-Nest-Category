/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "product";

export interface ProductOperationResponse {
  status: number;
  error: string[];
  id: number;
  message: string;
}

export interface ProductCategory {
  id: number;
  name: string;
}

/** CreateProduct */
export interface CreateProductRequest {
  name: string;
  sku: string;
  stock: number;
  price: number;
  brand: string;
  category: number;
}

/** FindOne */
export interface FindOneData {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
  brand: string;
  category: ProductCategory | undefined;
}

export interface FindOneProductRequest {
  id: number;
}

export interface FindOneProductResponse {
  status: number;
  error: string[];
  data: FindOneData | undefined;
}

/** DecreaseStock */
export interface DecreaseStockRequest {
  id: number;
  userId: number;
  quantity: number;
  reason: string;
}

export interface DecreaseStockResponse {
  status: number;
  error: string[];
}

/** GetProductsByIds */
export interface ProductsByIdsData {
  id: number;
  sku: string;
  stock: number;
  price: number;
  brand: string;
  category: number;
}

export interface GetProductsByIdsRequest {
  ids: number[];
}

export interface GetProductsByIdsResponse {
  status: number;
  error: string[];
  data: ProductsByIdsData[];
}

export const PRODUCT_PACKAGE_NAME = "product";

export interface ProductServiceClient {
  createProduct(request: CreateProductRequest): Observable<ProductOperationResponse>;

  findOne(request: FindOneProductRequest): Observable<FindOneProductResponse>;

  decreaseStock(request: DecreaseStockRequest): Observable<DecreaseStockResponse>;

  getProductsByIds(request: GetProductsByIdsRequest): Observable<GetProductsByIdsResponse>;
}

export interface ProductServiceController {
  createProduct(
    request: CreateProductRequest,
  ): Promise<ProductOperationResponse> | Observable<ProductOperationResponse> | ProductOperationResponse;

  findOne(
    request: FindOneProductRequest,
  ): Promise<FindOneProductResponse> | Observable<FindOneProductResponse> | FindOneProductResponse;

  decreaseStock(
    request: DecreaseStockRequest,
  ): Promise<DecreaseStockResponse> | Observable<DecreaseStockResponse> | DecreaseStockResponse;

  getProductsByIds(
    request: GetProductsByIdsRequest,
  ): Promise<GetProductsByIdsResponse> | Observable<GetProductsByIdsResponse> | GetProductsByIdsResponse;
}

export function ProductServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createProduct", "findOne", "decreaseStock", "getProductsByIds"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PRODUCT_SERVICE_NAME = "ProductService";
