import { PrismaClient } from '@prisma/client';
import { CreateOrderInput } from '../validation/createOrderInput';
import { ShopifyIdConflictError } from '../errors/ShopifyIdConflictError';
import { ProductsApi } from '../externalServices/productsApi';
import { ProductNotFoundError } from '../errors/ProductNotFoundError';

export class OrdersService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly productsApi: ProductsApi
  ) {}

  async create(data: CreateOrderInput) {
    if (data.shopifyId) {
      const existing = await this.prisma.order.findFirst({
        where: {
          shopifyId: data.shopifyId,
        },
      });

      if (existing) {
        throw new ShopifyIdConflictError(data.shopifyId);
      }
    }

    const productIds = data.products.map((product) => product.id);

    const products = await this.productsApi.getProductsByIds(productIds);

    const isAnyProductMissing = data.products.some(
      ({ id }) => !products.find((product) => product.id === id)
    );

    if (isAnyProductMissing) {
      throw new ProductNotFoundError();
    }

    const productsWithQuantity = products.map((product) => ({
      ...product,
      quantity: data.products.find((p) => p.id === product.id)?.quantity ?? 1,
    }));

    return this.prisma.order.create({
      data: {
        shopifyId: data.shopifyId,
        products: {
          createMany: {
            data: productsWithQuantity.map((product) => ({
              id: product.id,
              price: product.price,
              quantity: product.quantity,
              title: product.title,
            })),
          },
        },
      },
    });
  }

  async list() {
    return this.prisma.order.findMany();
  }
}
