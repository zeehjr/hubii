import { z } from 'zod';

const EnvironmentVariablesSchema = z.object({
  SHOPIFY_ACCESS_TOKEN: z.string(),
  SHOPIFY_STORE_DOMAIN: z.string(),
  DATABASE_URL: z.string(),
  ORDERS_SERVICE_URL: z.string(),
  PRODUCTS_SERVICE_URL: z.string(),
});

export function getEnvironmentVariables() {
  const parseResult = EnvironmentVariablesSchema.safeParse(process.env);

  return parseResult;
}
