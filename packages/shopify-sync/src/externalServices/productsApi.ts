import axios from 'axios';
import { ZodError, z } from 'zod';
import { ServiceUnavailableError } from '../errors/ServiceUnavailableError';
import { DivergentSchemaError } from '../errors/DivergentSchemaError';
import { Result } from 'utils';

const ProductWithShopifyIdSchema = z.object({
  id: z.number(),
  shopifyId: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  price: z.string(),
});

export type Product = z.output<typeof ProductWithShopifyIdSchema>;

const ProductsResponseSchema = z.object({
  data: z.array(ProductWithShopifyIdSchema),
});

const ProductCreateResponseSchema = z.object({
  data: ProductWithShopifyIdSchema,
});

export type ProductInput = {
  title: string;
  description: string;
  shopifyId: string;
  price: string;
};

export class ProductsApi {
  private serviceName = 'ProductsService';

  constructor(private readonly productsApiUrl: string) {}

  async getSinceId(
    id: number
  ): Promise<
    Result<Array<Product>, DivergentSchemaError | ServiceUnavailableError>
  > {
    const url = `${this.productsApiUrl}/products?sinceId=${id}`;

    try {
      const response = await axios.get(url);

      const { data } = ProductsResponseSchema.parse(response.data);

      return Result.ok(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return Result.error(
          new DivergentSchemaError(this.serviceName, url, error.issues)
        );
      }

      return Result.error(
        new ServiceUnavailableError(this.serviceName, this.productsApiUrl)
      );
    }
  }

  async getByShopifyIds(
    ids: string[]
  ): Promise<
    Result<Array<Product>, DivergentSchemaError | ServiceUnavailableError>
  > {
    const url = `${this.productsApiUrl}/products?shopifyIds=${ids.join(',')}`;
    try {
      const response = await axios.get(url);

      const { data } = ProductsResponseSchema.parse(response.data);

      return Result.ok(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return Result.error(
          new DivergentSchemaError(this.serviceName, url, error.issues)
        );
      }

      return Result.error(
        new ServiceUnavailableError(this.serviceName, this.productsApiUrl)
      );
    }
  }

  async create(
    product: ProductInput
  ): Promise<Result<Product, DivergentSchemaError | ServiceUnavailableError>> {
    const url = `${this.productsApiUrl}/products`;
    try {
      const response = await axios.post(url, product);

      const { data } = ProductCreateResponseSchema.parse(response.data);

      return Result.ok(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return Result.error(
          new DivergentSchemaError(this.serviceName, url, error.issues)
        );
      }

      return Result.error(
        new ServiceUnavailableError(this.serviceName, this.productsApiUrl)
      );
    }
  }
}
