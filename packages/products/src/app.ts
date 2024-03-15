import { PrismaClient } from '../prisma/client';
import express from 'express';
import { ProductsService } from './services/productsService';
import { ProductsController } from './controllers/productsController';

type AppContext = {
  prismaClient: PrismaClient;
};

export function createApp({ prismaClient }: AppContext) {
  const app = express();
  app.use(express.json());

  const productsService = new ProductsService(prismaClient);
  const productsController = new ProductsController(productsService);

  app.get('/health', (_, res) => {
    return res.sendStatus(200);
  });

  app.get('/products', productsController.list);
  app.post('/products', productsController.create);
  app.put('/products/:id', productsController.update);

  return app;
}
