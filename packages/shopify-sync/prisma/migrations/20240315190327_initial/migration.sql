-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('info', 'warning', 'error');

-- CreateTable
CREATE TABLE "SyncTrackerData" (
    "id" TEXT NOT NULL,
    "last_synced_shopify_order_id" TEXT,
    "last_synced_shopify_order_at" TIMESTAMP(3),
    "last_synced_product_id" INTEGER,
    "last_synced_product_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncTrackerData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "log_type" "LogType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
