import { z } from 'zod';

export const CreateProductInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string(),
  shopifyId: z.string().optional().nullable(),
});

export type CreateProductInput = z.output<typeof CreateProductInputSchema>;
