/*
  Warnings:

  - You are about to drop the `_ProductToSupplier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToSupplier" DROP CONSTRAINT "_ProductToSupplier_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSupplier" DROP CONSTRAINT "_ProductToSupplier_B_fkey";

-- DropTable
DROP TABLE "_ProductToSupplier";

-- CreateTable
CREATE TABLE "products_on_suppliers_pos" (
    "price_pos" DECIMAL(65,30),
    "supplierId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "supplier_category_pos" TEXT,
    "units_per_paq_pos" INTEGER,
    "minimum_quantity_pos" DECIMAL(65,30),
    "sales_terms_pos" TEXT,
    "lead_time_days_pos" INTEGER,

    CONSTRAINT "products_on_suppliers_pos_pkey" PRIMARY KEY ("supplierId","productId")
);

-- AddForeignKey
ALTER TABLE "products_on_suppliers_pos" ADD CONSTRAINT "products_on_suppliers_pos_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers_s"("id_supplier_s") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_on_suppliers_pos" ADD CONSTRAINT "products_on_suppliers_pos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products_p"("id_product_p") ON DELETE RESTRICT ON UPDATE CASCADE;
