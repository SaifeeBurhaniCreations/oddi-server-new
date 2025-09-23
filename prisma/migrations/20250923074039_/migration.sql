/*
  Warnings:

  - The values [OPERATOR,VIEWER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `profilePic` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ProductionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."RawMaterialCategory" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "public"."ChamberType" AS ENUM ('FROZEN', 'DRY');

-- CreateEnum
CREATE TYPE "public"."TruckStatus" AS ENUM ('AVAILABLE', 'IN_TRANSIT', 'LOADING', 'UNLOADING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."StockDirection" AS ENUM ('IN', 'OUT');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMIN', 'MANAGER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'MANAGER';
COMMIT;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'MANAGER',
ALTER COLUMN "profilePic" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "alias" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."raw_materials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" "public"."RawMaterialCategory" NOT NULL DEFAULT 'IN',
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "raw_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rm_orders" (
    "id" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "quantityOrdered" INTEGER NOT NULL,
    "quantityReceived" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "orderedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recDate" TIMESTAMP(3),
    "estRecDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "truckDetailId" TEXT,

    CONSTRAINT "rm_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_data" (
    "id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL DEFAULT 5,
    "warehousedDate" TIMESTAMP(3),
    "sampleQuantity" INTEGER,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rmOrderId" TEXT NOT NULL,
    "productionId" TEXT NOT NULL,

    CONSTRAINT "order_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."productions" (
    "id" TEXT NOT NULL,
    "status" "public"."ProductionStatus" NOT NULL DEFAULT 'PENDING',
    "batchCode" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "recovery" DECIMAL(5,2),
    "wastageQn" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "laneId" TEXT,
    "image" TEXT,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lanes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metaData" JSONB,

    CONSTRAINT "lanes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chambers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" "public"."ChamberType" NOT NULL DEFAULT 'FROZEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chambers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chamber_stock" (
    "id" TEXT NOT NULL,
    "category" "public"."RawMaterialCategory" NOT NULL DEFAULT 'IN',
    "rating" SMALLINT NOT NULL DEFAULT 5,
    "quantity" INTEGER NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "chamberId" TEXT NOT NULL,

    CONSTRAINT "chamber_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."packaging" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "productId" TEXT NOT NULL,

    CONSTRAINT "packaging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."packets" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'KG',

    CONSTRAINT "packets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dispatch_orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "dispatchDate" TIMESTAMP(3),
    "estDeliveredDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "truckDetailId" TEXT,

    CONSTRAINT "dispatch_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_products" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "chamberId" TEXT NOT NULL,
    "packagingId" TEXT,
    "chamberStockId" TEXT NOT NULL,
    "dispatchOrderId" TEXT NOT NULL,

    CONSTRAINT "order_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."truck_details" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "contact" TEXT,
    "status" "public"."TruckStatus" NOT NULL DEFAULT 'AVAILABLE',
    "challanId" TEXT,

    CONSTRAINT "truck_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challans" (
    "id" TEXT NOT NULL,
    "tareWeight" DECIMAL(8,2) NOT NULL,
    "netWeight" DECIMAL(8,2) NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "challans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_movements" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "chamberId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "direction" "public"."StockDirection" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ProductPackets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductPackets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_OrderImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_OrderProductPackets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderProductPackets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "productions_batchCode_key" ON "public"."productions"("batchCode");

-- CreateIndex
CREATE UNIQUE INDEX "chamber_stock_rawMaterialId_chamberId_key" ON "public"."chamber_stock"("rawMaterialId", "chamberId");

-- CreateIndex
CREATE UNIQUE INDEX "truck_details_number_key" ON "public"."truck_details"("number");

-- CreateIndex
CREATE INDEX "stock_movements_productId_chamberId_idx" ON "public"."stock_movements"("productId", "chamberId");

-- CreateIndex
CREATE INDEX "stock_movements_createdAt_idx" ON "public"."stock_movements"("createdAt");

-- CreateIndex
CREATE INDEX "_ProductPackets_B_index" ON "public"."_ProductPackets"("B");

-- CreateIndex
CREATE INDEX "_OrderImages_B_index" ON "public"."_OrderImages"("B");

-- CreateIndex
CREATE INDEX "_OrderProductPackets_B_index" ON "public"."_OrderProductPackets"("B");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_profilePic_fkey" FOREIGN KEY ("profilePic") REFERENCES "public"."images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."raw_materials" ADD CONSTRAINT "raw_materials_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rm_orders" ADD CONSTRAINT "rm_orders_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "public"."raw_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rm_orders" ADD CONSTRAINT "rm_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rm_orders" ADD CONSTRAINT "rm_orders_truckDetailId_fkey" FOREIGN KEY ("truckDetailId") REFERENCES "public"."truck_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_data" ADD CONSTRAINT "order_data_rmOrderId_fkey" FOREIGN KEY ("rmOrderId") REFERENCES "public"."rm_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_data" ADD CONSTRAINT "order_data_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "public"."productions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_data" ADD CONSTRAINT "order_data_image_fkey" FOREIGN KEY ("image") REFERENCES "public"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."productions" ADD CONSTRAINT "productions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."productions" ADD CONSTRAINT "productions_laneId_fkey" FOREIGN KEY ("laneId") REFERENCES "public"."lanes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."productions" ADD CONSTRAINT "productions_image_fkey" FOREIGN KEY ("image") REFERENCES "public"."images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chamber_stock" ADD CONSTRAINT "chamber_stock_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "public"."raw_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chamber_stock" ADD CONSTRAINT "chamber_stock_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "public"."chambers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dispatch_orders" ADD CONSTRAINT "dispatch_orders_truckDetailId_fkey" FOREIGN KEY ("truckDetailId") REFERENCES "public"."truck_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_products" ADD CONSTRAINT "order_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_products" ADD CONSTRAINT "order_products_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "public"."chambers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_products" ADD CONSTRAINT "order_products_chamberStockId_fkey" FOREIGN KEY ("chamberStockId") REFERENCES "public"."chamber_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_products" ADD CONSTRAINT "order_products_dispatchOrderId_fkey" FOREIGN KEY ("dispatchOrderId") REFERENCES "public"."dispatch_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."truck_details" ADD CONSTRAINT "truck_details_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "public"."challans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challans" ADD CONSTRAINT "challans_image_fkey" FOREIGN KEY ("image") REFERENCES "public"."images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductPackets" ADD CONSTRAINT "_ProductPackets_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."packaging"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductPackets" ADD CONSTRAINT "_ProductPackets_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrderImages" ADD CONSTRAINT "_OrderImages_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."dispatch_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrderImages" ADD CONSTRAINT "_OrderImages_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrderProductPackets" ADD CONSTRAINT "_OrderProductPackets_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."order_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OrderProductPackets" ADD CONSTRAINT "_OrderProductPackets_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."packets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
