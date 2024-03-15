import { PrismaClient } from '../../prisma/client';
import { CreateProductInput } from '../validation/createProductInput';
import { UpdateProductInput } from '../validation/updateProductInput';

export class ProductsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(product: CreateProductInput) {
    return this.prisma.product.create({
      data: product,
    });
  }

  async list(ids: string[], filterBy: 'none' | 'ids' | 'shopifyIds') {
    if (ids.length > 0 && filterBy === 'ids') {
      return this.prisma.product.findMany({
        where: {
          id: {
            in: ids.map(Number),
          },
        },
      });
    }

    if (ids.length > 0 && filterBy === 'shopifyIds') {
      return this.prisma.product.findMany({
        where: {
          shopifyId: {
            in: ids,
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
