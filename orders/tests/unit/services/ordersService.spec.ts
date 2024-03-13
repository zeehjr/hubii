import { Order, PrismaClient } from '@prisma/client';
import { mock, mockDeep, mockReset } from 'jest-mock-extended';
import { OrdersService } from '@/services/ordersService';
import { CreateOrderInput } from '../../../src/validation/createOrderInput';
import { ShopifyIdConflictError } from '../../../src/errors/ShopifyIdConflictError';
import {
  Product,
  ProductsApi,
} from '../../../src/externalServices/productsApi';
import { ProductNotFoundError } from '../../../src/errors/ProductNotFoundError';

describe('Orders Service', () => {
  const prismaMock = mockDeep<PrismaClient>();
  const productsApiMock = mock<ProductsApi>();

  const ordersService = new OrdersService(prismaMock, productsApiMock);

  describe('OrdersService.list', () => {
    const orderOne: Order = {
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      shopifyId: null,
    };

    test('should return database data', async () => {
      prismaMock.order.findMany.mockResolvedValue([orderOne]);

      const data = await ordersService.list();

      expect(data).toBeDefined();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBeDefined();
      expect(data[0].id).toBe('1');
    });

    afterEach(() => {
      mockReset(prismaMock);
    });
  });

  describe('OrdersService.create', () => {
    const orderInputWith3Products = {
      productsIds: ['1', '2', '3'],
    } satisfies CreateOrderInput;

    const threeProducts: Product[] = [
      {
        id: '1',
        title: 'Product 1',
        description: 'Product 1',
        price: 10,
      },
      {
        id: '2',
        title: 'Product 2',
        description: 'Product 2',
        price: 12,
      },
      {
        id: '3',
        title: 'Product 3',
        description: 'Product 3',
        price: 13,
      },
    ];

    test('should create an order and return it', async () => {
      prismaMock.order.create.mockResolvedValue({
        id: '1',
        createdAt: new Date(),
        shopifyId: null,
        updatedAt: new Date(),
      });

      productsApiMock.getProductsByIds.mockResolvedValue(threeProducts);

      const result = await ordersService.create(orderInputWith3Products);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.id).toBe('1');
    });

    test('should throw a ShopifyIdConflictError when an order with the same shopifyId already exists', () => {
      const shopifyId = 1;

      prismaMock.order.findFirst.mockResolvedValue({
        id: '1',
        shopifyId: shopifyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const inputWithShopifyId = {
        ...orderInputWith3Products,
        shopifyId: shopifyId,
      };

      expect(ordersService.create(inputWithShopifyId)).rejects.toThrow(
        ShopifyIdConflictError
      );
    });

    test('should throw ProductNotFoundError if any of the products is not found at ProductsApi', () => {
      productsApiMock.getProductsByIds.mockResolvedValue([
        threeProducts[0],
        threeProducts[1],
      ]);

      expect(ordersService.create(orderInputWith3Products)).rejects.toThrow(
        ProductNotFoundError
      );
    });

    afterEach(() => {
      mockReset(prismaMock);
      mockReset(productsApiMock);
    });
  });
});
