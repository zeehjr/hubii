import express from 'express';
import { OrdersController } from './controllers/ordersController';
import { PrismaClient } from '../prisma/client';
import { OrdersService } from './services/ordersService';
import { ProductsApi } from './externalServices/productsApi';

// TODO: add global error handling catcher

type AppContext = {
  prismaClient: PrismaClient;
};

export function createApp({ prismaClient }: AppContext) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_, res) => {
    return res.sendStatus(200);
  });

  const productsApi = new ProductsApi(process.env.PRODUCTS_API_URL ?? '');
  const ordersService = new OrdersService(prismaClient, productsApi);
  const ordersController = new OrdersController(ordersService);

  app.get('/orders', ordersController.list);
  app.post('/orders', ordersController.create);

  return app;
}
