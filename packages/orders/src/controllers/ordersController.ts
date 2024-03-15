import { Handler } from 'express';
import { OrdersService } from '../services/ordersService';
import { CreateOrderInputSchema } from '../validation/createOrderInput';
import { ZodError } from 'zod';
import { ProductNotFoundError } from '../errors/ProductNotFoundError';
import { ShopifyIdConflictError } from '../errors/ShopifyIdConflictError';

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  create: Handler = async (req, res) => {
    try {
      const body = CreateOrderInputSchema.parse(req.body);

      const data = await this.ordersService.create(body);

      return res.status(201).json({ data });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: error.errors,
        });
      }

      if (error instanceof ProductNotFoundError) {
        return res.status(400).json({
          message: 'One or more products were not found',
        });
      }

      if (error instanceof ShopifyIdConflictError) {
        return res.status(409).json({
          message: 'An order with this shopifyId already exists',
        });
      }

      console.error(error);

      return res.status(500).json({
        error,
      });
    }
  };

  list: Handler = async (_req, res) => {
    try {
      const data = await this.ordersService.list();

      return res.json({
        data,
      });
    } catch (error) {
      console.error(error);

      return res.sendStatus(500);
    }
  };
}
