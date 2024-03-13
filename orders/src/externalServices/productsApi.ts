import axios from 'axios';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.string(),
});

export type Product = z.output<typeof ProductSchema>;

const ProductsByIdsResponseSchema = z.object({
  data: z.array(ProductSchema),
});

export class ProductsApi {
  constructor(private readonly productsApiUrl: string) {}

  async getProductsByIds(ids: number[]) {
    const response = await axios.get(
      `${this.productsApiUrl}/products?ids=${ids.join(',')}`
    );

    const { data } = ProductsByIdsResponseSchema.parse(response.data);

    return data;
  }
}
