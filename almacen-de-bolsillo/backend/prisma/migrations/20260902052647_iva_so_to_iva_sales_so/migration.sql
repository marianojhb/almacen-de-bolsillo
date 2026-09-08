-- RenameColumn
ALTER TABLE "sales_orders_so"
RENAME COLUMN "iva_so"
TO "iva_sales_order_so";

-- RenameColumn
ALTER TABLE "purchase_orders_po"
RENAME COLUMN "iva_purchase_orders_po"
TO "iva_purchase_order_po";