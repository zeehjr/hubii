import axios from 'axios';
import { ZodError, z } from 'zod';
import { DivergentSchemaError } from '../errors/DivergentSchemaError';
import { BadRequestError } from '../errors/BadRequestError';
import { ServiceUnavailableError } from '../errors/ServiceUnavailableError';
import { Result } from 'utils';
import { UnknownError } from '../errors/UnknownError';

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

  async create(
    order: OrderInput
  ): Promise<
    Result<
      number,
      | DivergentSchemaError
      | BadRequestError
      | ServiceUnavailableError
      | UnknownError
    >
  > {
    const url = `${this.ordersApiUrl}/orders`;

    try {
      const response = await axios.post(url, order, {
        validateStatus: (status) => status === 201,
      });

      const newOrder = CreateOrderResponseSchema.parse(response.data);

      return Result.ok(newOrder.data.id);
    } catch (error) {
      if (error instanceof ZodError) {
        return Result.error(
          new DivergentSchemaError(this.serviceName, url, error.issues)
        );
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        if (status >= 400 && status < 500) {
          return Result.error(
            new BadRequestError({
              serviceName: this.serviceName,
              url: url,
              body: order,
              response: error.response,
            })
          );
        }

        return Result.error(
          new ServiceUnavailableError(this.serviceName, this.ordersApiUrl)
        );
      }

      // TODO: make UnknownError collect data about the error
      return Result.error(new UnknownError());
    }
  }
}
