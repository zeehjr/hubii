import { PrismaClient } from '@prisma/client';
import { OrdersApi } from './ordersApi';
import { ProductsApi } from './productsApi';
import { ShopifyApi } from './shopifyApi';
import { SyncDataService } from './syncDataService';
import { SyncOrderService } from './syncOrderService';
import { LogService } from './logService';
import { getEnvironmentVariables } from './config';

const env = getEnvironmentVariables();

if (!env.success) {
  console.error('One or more environment variables were not set correctly.');

  console.error(env.error.issues.map((issue) => issue.path));

  process.exit(1);
}

const prisma = new PrismaClient();
const shopifyApi = new ShopifyApi({
  accessToken: env.data.SHOPIFY_ACCESS_TOKEN,
  storeDomain: env.data.SHOPIFY_STORE_DOMAIN,
  itemsPerPage: 1,
});
const ordersApi = new OrdersApi(env.data.ORDERS_SERVICE_URL);
const productsApi = new ProductsApi(env.data.PRODUCTS_SERVICE_URL);
const syncDataService = new SyncDataService(prisma);
const logService = new LogService(prisma);

const syncOrderService = new SyncOrderService(
  ordersApi,
  productsApi,
  shopifyApi,
  syncDataService,
  logService
);

async function sync() {
  await syncOrderService.sync();

  setTimeout(sync, 5000);
}

sync();
