-- AddColumn
ALTER TABLE "sales_orders_so"
ADD COLUMN "subtotal_so" DECIMAL(10, 2) NOT NULL DEFAULT 0.00;