import axios from 'axios';
import { Result } from 'utils';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  price: z.string(),
  quantity: z.number(),
});

const OrderSchema = z.object({
  id: z.coerce.string(),
  total_price: z.string(),
  line_items: z.array(ProductSchema),
});

type Order = z.output<typeof OrderSchema>;

const GetOrdersResponseSchema = z.object({
  orders: z.array(OrderSchema),
});

export type ShopifyOrder = z.output<typeof OrderSchema>;

type ShopifyApiOptions = {
  accessToken: string;
  storeDomain: string;
  itemsPerPage?: number;
};
export class ShopifyApi {
  private accessToken: string;
  private baseUrl: string;
  private itemsPerPage: number;
  constructor({ accessToken, storeDomain, itemsPerPage }: ShopifyApiOptions) {
    this.accessToken = accessToken;
    this.baseUrl = `https://${storeDomain}.myshopify.com/admin/api/2024-01`;

    // Ensures we don't exceed the maximum items per page allowed by ShopifyApi
    this.itemsPerPage = Math.min(itemsPerPage ?? 250, 250);
  }

  async getOrders({
    status,
    pageInfo,
    sinceId,
  }: {
    status: ShopifyOrderStatus;
    pageInfo?: string;
    sinceId?: string;
  }): Promise<Result<GetOrdersResponse, Error>> {
    let url = '';

    if (pageInfo) {
      url = `${this.baseUrl}/orders.json?limit=${this.itemsPerPage}&page_info=${pageInfo}`;
    } else {
      url = `${this.baseUrl}/orders.json?limit=${this.itemsPerPage}&status=${status}`;
    }

    if (sinceId && !pageInfo) {
      url += `&since_id=${sinceId}`;
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
        },
      });

      const data = GetOrdersResponseSchema.parse(response.data);

      return Result.ok({
        orders: data.orders,
        pageInfo: extractPageInfo(response.headers.link),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      }

      return Result.error(error as Error);
    }
  }
}

type ShopifyOrderStatus = 'open' | 'closed' | 'cancelled' | 'any';

type GetOrdersResponse = { orders: Order[]; pageInfo: PageInfo };

type PageInfo = {
  previous?: string;
  next?: string;
};
function extractPageInfo(linkHeader?: string): PageInfo {
  if (!linkHeader) {
    return {};
  }

  const previousPattern = /.+page_info=([^>]+)>; rel="previous".*/;
  const nextPattern = /.+page_info=([^>]+)>; rel="next".*/;

  return {
    previous: previousPattern.test(linkHeader)
      ? linkHeader.replace(previousPattern, '$1')
      : undefined,
    next: nextPattern.test(linkHeader)
      ? linkHeader.replace(nextPattern, '$1')
      : undefined,
  };
}
