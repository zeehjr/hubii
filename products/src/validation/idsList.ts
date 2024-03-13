import { z } from 'zod';

const isCommaSeparatedString = (s: string) => /((.+),?)+[^,]$/.test(s);

export const IdsListSchema = z
  .array(z.string())
  .or(z.string().refine(isCommaSeparatedString))
  .optional();
