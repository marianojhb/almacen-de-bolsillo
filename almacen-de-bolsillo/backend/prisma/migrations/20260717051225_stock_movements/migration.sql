-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'SALE', 'MANUAL_ENTRY', 'MANUAL_EXIT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "stock_movements_sm" (
    "id_stockmovement_sm" SERIAL NOT NULL,
    "type_sm" "StockMovementType" NOT NULL,
    "product_id_sm" INTEGER NOT NULL,
    "quantity_sm" INTEGER NOT NULL,
    "previous_stock_sm" INTEGER NOT NULL,
    "new_stock_sm" INTEGER NOT NULL,
    "reason_sm" TEXT NOT NULL,
    "created_at_sm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_sm_pkey" PRIMARY KEY ("id_stockmovement_sm")
);

-- AddForeignKey
ALTER TABLE "stock_movements_sm" ADD CONSTRAINT "stock_movements_sm_product_id_sm_fkey" FOREIGN KEY ("product_id_sm") REFERENCES "products_p"("id_product_p") ON DELETE RESTRICT ON UPDATE CASCADE;
