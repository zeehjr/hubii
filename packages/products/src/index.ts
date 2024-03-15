import { PrismaClient } from '../prisma/client';
import { createApp } from './app';

const PORT = process.env.PORT ?? '8082';

const app = createApp({ prismaClient: new PrismaClient() });

app.listen(PORT, () => {
  console.info(`Products service is running at http://localhost:${PORT}`);
});
