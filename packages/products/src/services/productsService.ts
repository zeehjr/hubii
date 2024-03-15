import { PrismaClient } from '../../prisma/client';
import { CreateProductInput } from '../validation/createProductInput';
import { ListProductsFilter } from '../validation/listProductsFilterSchema';
import { UpdateProductInput } from '../validation/updateProductInput';

export class ProductsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(product: CreateProductInput) {
    return this.prisma.product.create({
      data: product,
    });
  }

  async list({ filter }: { filter?: ListProductsFilter } = { filter: {} }) {
    if (filter?.ids) {
      return this.prisma.product.findMany({
        where: {
          id: {
            in: filter.ids,
          },
        },
      });
    }

    if (filter?.shopifyIds) {
      return this.prisma.product.findMany({
        where: {
          shopifyId: {
            in: filter.shopifyIds,
          },
        },
      });
    }

    if (filter?.sinceId) {
      return this.prisma.product.findMany({
        where: {
          id: {
            gt: filter.sinceId,
          },
        },
      });
    }

    return this.prisma.product.findMany();
  }

  async update(id: number, product: UpdateProductInput) {
    return this.prisma.product.update({
      where: {
        id: id,
      },
      data: product,
    });
  }
}
