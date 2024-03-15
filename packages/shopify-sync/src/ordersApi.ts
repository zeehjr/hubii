import axios from 'axios';
import { ZodError, z } from 'zod';
import { DivergentSchemaError } from './errors/DivergentSchemaError';
import { BadRequestError } from './errors/BadRequestError';
import { ServiceUnavailableError } from './errors/ServiceUnavailableError';

type OrderProduct = {
  id: number;
  quantity: number;
  price: string;
};
type OrderInput = {
  shopifyId: string;
  products: OrderProduct[];
};

const CreateOrderResponseSchema = z.object({
  data: z.object({
    id: z.number(),
  }),
});

export class OrdersApi {
  private serviceName = 'OrdersService';

  constructor(private readonly ordersApiUrl: string) {}

  async create(order: OrderInput): Promise<number> {
    const url = `${this.ordersApiUrl}/orders`;

    try {
      const response = await axios.post(url, order, {
        validateStatus: (status) => status === 201,
      });

      const newOrder = CreateOrderResponseSchema.parse(response.data);

      return newOrder.data.id;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new DivergentSchemaError(this.serviceName, url, error.issues);
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        if (status >= 400 && status < 500) {
          throw new BadRequestError({
            serviceName: this.serviceName,
            url: url,
            body: order,
            response: error.response,
          });
        }

        throw new ServiceUnavailableError(this.serviceName, this.ordersApiUrl);
      }

      throw error;
    }
  }
}
