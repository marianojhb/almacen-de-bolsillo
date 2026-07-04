/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_id_category_p_fkey";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "products";

-- CreateTable
CREATE TABLE "products_p" (
    "id_product_p" SERIAL NOT NULL,
    "sku_p" TEXT NOT NULL,
    "shortname_p" TEXT NOT NULL,
    "longname_p" TEXT NOT NULL,
    "description_p" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "price_p" DECIMAL(10,2) NOT NULL,
    "stock_p" INTEGER NOT NULL DEFAULT 0,
    "stock_min_p" INTEGER NOT NULL DEFAULT 0,
    "discount_p" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "id_category_p" INTEGER NOT NULL,

    CONSTRAINT "products_p_pkey" PRIMARY KEY ("id_product_p")
);

-- CreateTable
CREATE TABLE "categories_c" (
    "id_category_c" SERIAL NOT NULL,
    "name_c" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_c_pkey" PRIMARY KEY ("id_category_c")
);

-- CreateTable
CREATE TABLE "suppliers_s" (
    "id_supplier_s" SERIAL NOT NULL,
    "name_s" TEXT NOT NULL,
    "cuit_s" TEXT NOT NULL,
    "phone_s" TEXT NOT NULL,
    "email_s" TEXT NOT NULL,
    "address_s" TEXT NOT NULL,
    "status_s" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_s_pkey" PRIMARY KEY ("id_supplier_s")
);

-- CreateTable
CREATE TABLE "purchase_orders_po" (
    "id_purchase_orders_po" SERIAL NOT NULL,
    "date_po" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_po" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "id_supplier_po" INTEGER NOT NULL,

    CONSTRAINT "purchase_orders_po_pkey" PRIMARY KEY ("id_purchase_orders_po")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_p_sku_p_key" ON "products_p"("sku_p");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_s_cuit_s_key" ON "suppliers_s"("cuit_s");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_id_purchase_orders_po_key" ON "purchase_orders_po"("id_purchase_orders_po");

-- AddForeignKey
ALTER TABLE "products_p" ADD CONSTRAINT "products_p_id_category_p_fkey" FOREIGN KEY ("id_category_p") REFERENCES "categories_c"("id_category_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_supplier_po_fkey" FOREIGN KEY ("id_supplier_po") REFERENCES "suppliers_s"("id_supplier_s") ON DELETE RESTRICT ON UPDATE CASCADE;
