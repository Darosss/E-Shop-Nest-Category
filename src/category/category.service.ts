import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import {
  CreateCategoryRequestDto,
  FindOneByCategorySlugRequestDto,
  FindOneByHeadSlugRequestDto,
  FindOneBySubHeadSlugRequestDto,
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
    const foundCategory = await this.repository.findOne({
      where: { id },
      relations: {
        subcategories: true,
        parent: true,
      },
    });

    if (!foundCategory) {
      return {
        data: null,
        error: ['Category not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    return await this.findCategoryAndProducts(foundCategory);
  }

  public async findOneByHeadSlug({
    headSlug,
  }: FindOneByHeadSlugRequestDto): Promise<FindOneCategoryResponse> {
    const foundCategory = await this.repository.findOne({
      where: { name: headSlug },
      relations: {
        subcategories: true,
        parent: true,
      },
    });

    if (!foundCategory) {
      return {
        data: null,
        error: ['Category not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    return await this.findCategoryAndProducts(foundCategory);
  }

  public async findOneBySubHeadSlug({
    headSlug,
    subHeadSlug,
  }: FindOneBySubHeadSlugRequestDto): Promise<FindOneCategoryResponse> {
    const foundCategory = await this.repository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.subcategories', 'subcategories')
      .where('parent.name = :headSlug', { headSlug })
      .andWhere('category.name = :subHeadSlug', { subHeadSlug })
      .getOne();

    if (!foundCategory) {
      return {
        data: null,
        error: ['Category not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    return await this.findCategoryAndProducts(foundCategory);
  }

  public async findOneByCategorySlug({
    headSlug,
    subHeadSlug,
    categorySlug,
  }: FindOneByCategorySlugRequestDto): Promise<FindOneCategoryResponse> {
    const foundCategory = await this.repository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'subHead')
      .leftJoinAndSelect('subHead.parent', 'head')
      .where('category.name = :categorySlug', { categorySlug })
      .andWhere('subHead.name = :subHeadSlug', { subHeadSlug })
      .andWhere('head.name = :headSlug', { headSlug })
      .getOne();

    if (!foundCategory) {
      return {
        data: null,
        error: ['Category not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    return await this.findCategoryAndProducts(foundCategory);
  }

  private async findCategoryAndProducts(
    category: Category,
  ): Promise<FindOneCategoryResponse> {
    const {
      data: products,
      error: errorProducts,
      status: statusProducts,
    } = await this.findProductsByCategoryId(category.id);

    if (errorProducts) {
      return {
        data: null,
        error: errorProducts,
        status: statusProducts,
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

  private async findProductsByCategoryId(categoryId: number) {
    const categoriesIds = await this.findCategoryIdsAndSubcategoryIds(
      categoryId,
    );

    const {
      status: productsStatus,
      data: products,
      error,
    } = await firstValueFrom(
      this.productSvc.findAll({ categories: categoriesIds }),
    );
    if (productsStatus !== HttpStatus.OK) {
      return {
        data: null,
        error: error,
        status: productsStatus,
      };
    } else {
      return {
        data: products,
        error: null,
        status: productsStatus,
      };
    }
  }

  public async findAll(): Promise<FindAllCategoriesResponse> {
    const categories = await this.repository.find({
      where: {
        parentId: IsNull(),
      },
      relations: {
        subcategories: true,
        parent: true,
      },
    });

    if (!categories) {
      return {
        data: null,
        error: ['Categories not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    const modifiedCategoriesList = await this.getThirdSubCategoriesDepth(
      categories,
    );

    return {
      data: modifiedCategoriesList,
      error: null,
      status: HttpStatus.OK,
    };
  }

  private async getThirdSubCategoriesDepth(categories: Category[]) {
    const modifiedCategoriesList = [];
    for await (const cat of categories) {
      const subcategoriesList: Category[] = [];
      for await (const subCat of cat.subcategories) {
        const subcategories = await this.repository.findOne({
          where: { id: subCat.id },
          relations: { subcategories: true },
        });
        subcategoriesList.push(subcategories);
      }

      modifiedCategoriesList.push({ ...cat, subcategories: subcategoriesList });
    }

    return modifiedCategoriesList;
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
