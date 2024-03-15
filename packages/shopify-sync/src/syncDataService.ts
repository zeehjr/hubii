import { PrismaClient } from '../prisma/client';

export class SyncDataService {
  constructor(private readonly prisma: PrismaClient) {}

  private async initializeData() {
    const data = await this.prisma.syncTrackerData.create({
      data: {},
    });

    return data;
  }

  async getData() {
    const data = await this.prisma.syncTrackerData.findFirst();

    if (!data) {
      return this.initializeData();
    }

    return data;
  }

  async setLastSyncedOrder(shopifyOrderId: string) {
    const data = await this.getData();

    await this.prisma.syncTrackerData.update({
      where: {
        id: data.id,
      },
      data: {
        lastSyncedShopifyOrderAt: new Date(),
        lastSyncedShopifyOrderId: shopifyOrderId,
      },
    });
  }
}
