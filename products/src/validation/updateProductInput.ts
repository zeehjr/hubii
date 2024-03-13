import { z } from 'zod';

export const UpdateProductInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
});

export type UpdateProductInput = z.output<typeof UpdateProductInputSchema>;
