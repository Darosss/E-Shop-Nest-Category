import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import {
  CreateCategoryRequestDto,
  FindOneRequestDto,
  UpdateCategoryRequestDto,
} from './dto/category.dto';
import {
  CategoryOperationResponse,
  FindAllCategoriesResponse,
  FindOneCategoryResponse,
  GetCategoriesByIdsResponse,
} from './pb/category.pb';
import { ClientGrpc } from '@nestjs/microservices';
import { PRODUCT_SERVICE_NAME, ProductServiceClient } from './pb/product.pb';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CategoryService implements OnModuleInit {
  private productSvc: ProductServiceClient;

  @Inject(PRODUCT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  @InjectRepository(Category)
  private readonly repository: Repository<Category>;

  public onModuleInit(): void {
    this.productSvc =
      this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  public async findOne({
    id,
  }: FindOneRequestDto): Promise<FindOneCategoryResponse> {
    const category = await this.repository.findOne({
      where: { id },

      relations: {
        subcategories: true,
        parent: true,
      },
    });

    if (!category) {
      return {
        data: null,
        error: ['Category not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    const categoriesIds = await this.findCategoryIdsAndSubcategoryIds(
      category.id,
    );

    const {
      status,
      data: products,
      error,
    } = await firstValueFrom(
      this.productSvc.findAll({ categories: categoriesIds }),
    );
    if (status !== HttpStatus.OK) {
      return {
        data: null,
        error: error,
        status: status,
      };
    }

    return {
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        parent: category.parent,
        subcategories: category.subcategories,
        images: category.images,
        products: products,
      },
      error: null,
      status: HttpStatus.OK,
    };
  }

  public async findAll(): Promise<FindAllCategoriesResponse> {
    const category = await this.repository.find({
      relations: {
        subcategories: true,
        parent: true,
      },
    });

    if (!category) {
      return {
        data: null,
        error: ['Category not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    return {
      data: category,
      error: null,
      status: HttpStatus.OK,
    };
  }

  public async createCategory(
    payload: CreateCategoryRequestDto,
  ): Promise<CategoryOperationResponse> {
    const category: Category = new Category();
    const { name, description, parentId, subcategoriesIds } = payload;
    // add parent if in request
    if (parentId) {
      const parent = await this.repository.findOneBy({ id: parentId });
      category.parent = parent;
    }
    // add subcategories if in request
    if (subcategoriesIds) {
      const subcategories = await this.getCategoriesByIdsLocal(
        subcategoriesIds,
      );
      category.subcategories = subcategories;
    }

    category.name = name;
    category.description = description;

    await this.repository.save(category);

    return {
      id: category.id,
      error: null,
      message: 'Category created successfully',
      status: HttpStatus.OK,
    };
  }

  public async updateCategory(
    payload: UpdateCategoryRequestDto,
  ): Promise<CategoryOperationResponse> {
    const { id, name, description, parentId, subcategoriesIds, images } =
      payload;

    const category = await this.repository.findOneBy({ id });
    if (!category)
      return {
        id: id,
        error: [`Category with provided id does not exist`],
        message: '',
        status: HttpStatus.NOT_FOUND,
      };

    // change parent if in request
    //FIXME: for now it always update even if they are the same. Fix this later
    if (parentId) {
      const parent = await this.repository.findOneBy({ id: parentId });
      category.parent = parent;
    } else {
      category.parent = null;
    }

    // update subcategories if in request
    //FIXME: for now it always update even if they are the same. Fix this later
    if (subcategoriesIds) {
      const subcategories = await this.getCategoriesByIdsLocal(
        subcategoriesIds,
      );
      category.subcategories = subcategories;
    } else {
      category.subcategories = null;
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.images = images || category.images;

    await this.repository.save(category);

    return {
      id: category.id,
      error: null,
      message: 'Category updated successfully',
      status: HttpStatus.OK,
    };
  }

  public async getCategoriesByIds(
    ids: number[],
  ): Promise<GetCategoriesByIdsResponse> {
    const categories = await this.repository
      .createQueryBuilder('category')
      .where('category.id IN (:...ids)', { ids })
      .getMany();

    const modifiedCategories = categories.map((x) => {
      return {
        ...x,
        subcategories: x.subcategories.map((subCat) => subCat.id),
        parent: x.parent.id,
      };
    });

    return { data: modifiedCategories, error: null, status: HttpStatus.OK };
  }

  private async getCategoriesByIdsLocal(ids: number[]): Promise<Category[]> {
    return await this.repository
      .createQueryBuilder('category')
      .where('category.id IN (:...ids)', { ids })
      .getMany();
  }

  async findCategoryIdsAndSubcategoryIds(
    categoryId: number,
  ): Promise<number[]> {
    const category = await this.repository.findOne({
      where: { id: categoryId },
      select: { id: true },
      relations: { subcategories: true },
    });

    if (!category) {
      return [];
    }

    const subcategoryIds = [];
    for (const subcategory of category.subcategories) {
      const subcategoryIdsRecursive =
        await this.findCategoryIdsAndSubcategoryIds(subcategory.id);
      subcategoryIds.push(...subcategoryIdsRecursive);
    }

    return [category.id, ...subcategoryIds];
  }
}
