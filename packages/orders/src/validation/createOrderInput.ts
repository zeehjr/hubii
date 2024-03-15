import { z } from 'zod';

export const OrderProductSchema = z.object({
  id: z.number(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.string(),
});

export const CreateOrderInputSchema = z.object({
  shopifyId: z.string().optional(),
  products: z
    .array(OrderProductSchema)
    .min(1, 'At least 1 product is required'),
});

export type CreateOrderInput = z.output<typeof CreateOrderInputSchema>;
