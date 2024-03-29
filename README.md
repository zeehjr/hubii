## Instructions

### Prerequisites

Before running this application, ensure you have the following prerequisites installed on your system:

- Docker
- Docker Compose
- Node.js v16+ (v20 recommended)
- PNPM Package Manager (since we use pnpm workspaces)
- Shopify account with store and an [admin API access token](https://help.plytix.com/en/getting-api-credentials-from-your-shopify-store)

### Getting Started

To run the application locally, follow these steps:

1. **Install Dependencies:** Run this command at the root directory:

```
pnpm install
```

2. **Generate Prisma Client:** Run the following command in the root directory:

```
pnpm prisma:generate
```

3. **Set Environment Variables:** Create a `.env` file in each application directory based on its respective `.env.example` file. Make sure to fill in the required credentials and configurations.

4. **Run Docker Compose:** Start the PostgreSQL instance by running the following command at the project root:

```
docker compose up
```

This command sets up a PostgreSQL instance on port 5432.

5. **Database Migration:** Migrate all databases by executing the following command in the root directory:

```
pnpm prisma:migrate
```

6. **Start the Applications:** Finally, run the applications by executing the following command in the root directory:

```
pnpm dev
```
