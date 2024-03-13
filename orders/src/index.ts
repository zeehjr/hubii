import { PrismaClient } from '@prisma/client';
import { createApp } from './app';

const PORT = process.env.PORT ?? '8081';

const app = createApp({ prismaClient: new PrismaClient() });

app.listen(PORT, () => {
  console.info(`Orders service is running at http://localhost:${PORT}`);
});
