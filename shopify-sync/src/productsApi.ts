import axios from 'axios';
import { ZodError, z } from 'zod';
import { ServiceUnavailableError } from './errors/ServiceUnavailableError';
import { DivergentSchemaError } from './errors/DivergentSchemaError';

const ProductWithShopifyIdSchema = z.object({
  id: z.number(),
  shopifyId: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  price: z.string(),
});

export type Product = z.output<typeof ProductWithShopifyIdSchema>;

const ProductsByShopifyIdsResponseSchema = z.object({
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

export type ProductsApiResponse<T, E> =
  | {
      status: 'success';
      data: T;
    }
  | {
      status: 'error';
      error: E;
    };

export class ProductsApi {
  private serviceName = 'ProductsService';

  constructor(private readonly productsApiUrl: string) {}

  async getByShopifyIds(
    ids: string[]
  ): Promise<
    ProductsApiResponse<
      Array<Product>,
      DivergentSchemaError | ServiceUnavailableError
    >
  > {
    const url = `${this.productsApiUrl}/products?shopifyIds=${ids.join(',')}`;
    try {
      const response = await axios.get(url);

      const { data } = ProductsByShopifyIdsResponseSchema.parse(response.data);

      return {
        status: 'success',
        data,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          status: 'error',
          error: new DivergentSchemaError(this.serviceName, url, error.issues),
        };
      }

      return {
        status: 'error',
        error: new ServiceUnavailableError(
          this.serviceName,
          this.productsApiUrl
        ),
      };
    }
  }

  async create(
    product: ProductInput
  ): Promise<
    ProductsApiResponse<Product, DivergentSchemaError | ServiceUnavailableError>
  > {
    const url = `${this.productsApiUrl}/products`;
    try {
      const response = await axios.post(url, product);

      const { data } = ProductCreateResponseSchema.parse(response.data);

      return {
        status: 'success',
        data,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof ZodError) {
        return {
          status: 'error',
          error: new DivergentSchemaError(this.serviceName, url, error.issues),
        };
      }

      return {
        status: 'error',
        error: new ServiceUnavailableError(
          this.serviceName,
          this.productsApiUrl
        ),
      };
    }
  }
}
