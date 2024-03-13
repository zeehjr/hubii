import { Prisma, PrismaClient, Product } from '@prisma/client';
import { anyObject, mockDeep, mockReset } from 'jest-mock-extended';
import { ProductsService } from '../../src/services/productsService';

const productMock = {
  id: '1',
  title: '1',
  description: '1',
  price: new Prisma.Decimal(10),
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Product;

describe('ProductsService', () => {
  const prismaMock = mockDeep<PrismaClient>();
  const productsService = new ProductsService(prismaMock);

  describe('ProductsService.create', () => {
    test('should create and return the created product', async () => {
      prismaMock.product.create.mockResolvedValue(productMock);

      const result = await productsService.create({
        title: productMock.title,
        description: productMock.description,
        price: productMock.price.toNumber(),
      });

      expect(result).toBeDefined();
      expect(result).toBe(productMock);
    });
  });

  describe('ProductsService.list', () => {
    test('should return the products returned from database', async () => {
      prismaMock.product.findMany.calledWith().mockResolvedValue([productMock]);
      const result = await productsService.list([]);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(productMock.id);
    });

    test('should use the ids list to filter products', async () => {
      const ids = ['1'];

      prismaMock.product.findMany
        .calledWith(anyObject())
        .mockResolvedValue([productMock]);

      const result = await productsService.list(ids);

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ids,
          },
        },
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(productMock);
    });
  });

  describe('ProductsService.update', () => {
    test('should update and return the updated product', async () => {
      const oldProduct = productMock;
      const newProduct = {
        ...oldProduct,
        title: 'new title',
      };

      prismaMock.product.update
        .calledWith(anyObject())
        .mockResolvedValue(newProduct);

      const updateInput = {
        title: 'new title',
        description: oldProduct.description,
        price: oldProduct.price.toNumber(),
      };

      const result = await productsService.update(oldProduct.id, updateInput);

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: {
          id: oldProduct.id,
        },
        data: updateInput,
      });

      expect(result).toBeDefined();
      expect(result).toBe(newProduct);
    });
  });

  afterEach(() => {
    mockReset(prismaMock);
  });
});
