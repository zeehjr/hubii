import { BadRequestError } from './errors/BadRequestError';
import { DivergentSchemaError } from './errors/DivergentSchemaError';
import { ServiceUnavailableError } from './errors/ServiceUnavailableError';
import { LogService } from './logService';
import { OrdersApi } from './ordersApi';
import { Product, ProductsApi } from './productsApi';
import { ShopifyApi, ShopifyOrder } from './shopifyApi';
import { SyncDataService } from './syncDataService';

export class SyncOrderService {
  constructor(
    private readonly ordersApi: OrdersApi,
    private readonly productsApi: ProductsApi,
    private readonly shopifyApi: ShopifyApi,
    private readonly syncDataService: SyncDataService,
    private readonly logService: LogService
  ) {}

  async sync() {
    const trackerData = await this.syncDataService.getData();

    const lastOrderId = trackerData.lastSyncedShopifyOrderId;

    let result = await this.shopifyApi.getOrders({
      status: 'closed',
      // Apparently, when using sinceId is comes ordered by ID asc, that is exactly what we want
      sinceId: lastOrderId?.toString() ?? '0',
    });

    if (result.status === 'error') {
      await this.logService.log(
        'error',
        `There was an error while trying to get orders from ShopifyApi: ${result.error}`
      );
      return;
    }

    for (const order of result.data.orders) {
      const newOrder = await this.createOrder(order);

      if (!newOrder) return;
    }

    let lastSuccessfulResult = result;

    // TODO: move to a queue to avoid hitting rate limit
    while (result.data.pageInfo.next) {
      result = await this.shopifyApi.getOrders({
        status: 'closed',
        pageInfo: result.data.pageInfo.next,
      });

      if (result.status === 'error') {
        await this.logService.log(
          'error',
          `There was an error while trying to get orders from ShopifyApi: ${result.error}`
        );

        break;
      }

      for (const order of result.data.orders) {
        const newOrder = await this.createOrder(order);

        if (!newOrder) break;
      }

      lastSuccessfulResult = result;
    }

    const lastOrder = lastSuccessfulResult.data.orders.at(-1);

    if (lastOrder) {
      await this.syncDataService.setLastSyncedOrder(lastOrder.id);
    }
  }

  private async createOrder(order: ShopifyOrder) {
    const productsShopifyIds = order.line_items.map((item) => item.id);

    let existentProducts: Product[] = [];

    const productsApiResponse = await this.productsApi.getByShopifyIds(
      productsShopifyIds
    );

    if (productsApiResponse.status === 'error') {
      await this.logService.log('error', productsApiResponse.error.message);

      return;
    }

    existentProducts = productsApiResponse.data;

    const existentIds = existentProducts.map((product) => product.shopifyId);

    const productsToCreate = order.line_items.filter(
      (product) => !existentIds.includes(product.id)
    );

    if (productsToCreate.length > 0) {
      await this.logService.log(
        'info',
        `Going to create ${productsToCreate.length} products that doesn't exist and are required by Shopify's orderId ${order.id}`
      );
    }

    for (const product of productsToCreate) {
      const result = await this.productsApi.create({
        shopifyId: product.id,
        title: product.title,
        price: product.price,
        // TODO: ask shopify api for the product description???
        description: '',
      });

      if (result.status === 'error') {
        await this.logService.log(
          'error',
          `Couldn't create product with ShopifyId ${product.id} that is required for the order with shopifyId ${order.id} so the creation of the order was aborted. ${result.error}`
        );

        return;
      }

      // we add to our list to use it later while creating the order
      existentProducts.push(result.data);

      await this.logService.log(
        'info',
        `Product with ShopifyId ${product.id} required by Order with ShopifyId ${order.id} was successfully created and its ID in ProductsService is ${result.data.id})`
      );
    }

    try {
      const mergedProducts = existentProducts.map((product) => ({
        ...product,
        quantity:
          order.line_items.find((item) => item.id === product.shopifyId)
            ?.quantity ?? 1,
        price:
          order.line_items.find((item) => item.id === product.shopifyId)
            ?.price ?? '1.0',
      }));

      const result = await this.ordersApi.create({
        products: mergedProducts.map(({ id, quantity, price }) => ({
          id,
          quantity,
          price,
        })),
        shopifyId: order.id,
      });

      await this.logService.log(
        'info',
        `Order with ShopifyId ${order.id} was successfully created. OrdersService id: ${result}`
      );

      return result;
    } catch (error) {
      let reason = '';

      if (error instanceof BadRequestError) {
        reason = error.message;
      } else if (error instanceof DivergentSchemaError) {
        reason =
          'OrdersService returned data in a different format of what we were expecting.';
      } else if (error instanceof ServiceUnavailableError) {
        reason = 'OrdersService is unavailable';
      } else {
        console.error(error);
        reason = 'Unknown reason: ' + error;
      }

      await this.logService.log(
        'error',
        `Couldn't create order with ShopifyId ${order.id}. Reason: ${reason}`
      );
    }
  }
}
