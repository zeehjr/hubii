import { LogType, PrismaClient } from '@prisma/client';

export class LogService {
  constructor(private readonly prisma: PrismaClient) {}

  // TODO: allow syncing logs table periodically instead of syncing with each log
  async log(type: LogType, message: string) {
    // TODO: add error handling
    await this.prisma.log.create({
      data: {
        date: new Date(),
        logType: type,
        message,
      },
    });

    console.log(`${type}: ${message}`);
  }
}
