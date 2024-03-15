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
}
