/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "products" (
    "id_product_p" SERIAL NOT NULL,
    "sku_p" TEXT NOT NULL,
    "shortname_p" TEXT NOT NULL,
    "longname_p" TEXT NOT NULL,
    "description_p" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "price_p" DOUBLE PRECISION NOT NULL,
    "stock_p" INTEGER NOT NULL DEFAULT 0,
    "stock_min_p" INTEGER NOT NULL DEFAULT 0,
    "discount_p" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "id_category_p" INTEGER NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id_product_p")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_p_key" ON "products"("sku_p");
