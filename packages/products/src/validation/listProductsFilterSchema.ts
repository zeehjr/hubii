import { z } from 'zod';

const isCommaSeparatedString = (s: string) => /((.+),?)+[^,]$/.test(s);

export const IdsListSchema = z.array(z.string()).or(
  z
    .string()
    .refine(isCommaSeparatedString)
    .transform((str) => str.split(','))
);

export const ListProductsFilterSchema = z
  .object({
    ids: IdsListSchema.transform((strArr) => strArr.map(Number))
      .refine((n) => !Number.isNaN(n))
      .optional(),
    shopifyIds: z.undefined(),
    sinceId: z.undefined(),
  })
  .or(
    z.object({
      ids: z.undefined(),
      shopifyIds: IdsListSchema.optional(),
      sinceId: z.undefined(),
    })
  )
  .or(
    z.object({
      ids: z.undefined(),
      shopifyIds: z.undefined(),
      sinceId: z.coerce.number().optional(),
    })
  );

export type ListProductsFilter = z.output<typeof ListProductsFilterSchema>;
