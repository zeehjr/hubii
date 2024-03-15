import { PrismaClient } from '../prisma/client';
import { OrdersApi } from './externalServices/ordersApi';
import { ProductsApi } from './externalServices/productsApi';
import { ShopifyApi } from './externalServices/shopifyApi';
import { SyncDataService } from './services/syncDataService';
import { SyncOrdersService } from './services/syncOrdersService';
import { LogService } from './services/logService';
import { getEnvironmentVariables } from './config';
import { waitForService } from './utils/waitForService';

const env = getEnvironmentVariables();

if (!env.success) {
  console.error('One or more environment variables were not set correctly.');

  console.error(env.error.issues.flatMap((issue) => issue.path));

  process.exit(1);
}

await Promise.all([
  waitForService({
    healthCheckUrl: env.data.ORDERS_SERVICE_URL + '/health',
    intervalMs: 1000,
    onCheckFail: () => {
      console.log('Still waiting for OrdersService to get up...');
    },
  }),

  waitForService({
    healthCheckUrl: env.data.PRODUCTS_SERVICE_URL + '/health',
    intervalMs: 1000,
    onCheckFail: () => {
      console.log('Still waiting for ProductsService to get up...');
    },
  }),
]);

const prisma = new PrismaClient();
const shopifyApi = new ShopifyApi({
  accessToken: env.data.SHOPIFY_ACCESS_TOKEN,
  storeDomain: env.data.SHOPIFY_STORE_DOMAIN,
  itemsPerPage: 250,
});
const ordersApi = new OrdersApi(env.data.ORDERS_SERVICE_URL);
const productsApi = new ProductsApi(env.data.PRODUCTS_SERVICE_URL);
const syncDataService = new SyncDataService(prisma);
const logService = new LogService(prisma);

const syncOrderService = new SyncOrdersService(
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
