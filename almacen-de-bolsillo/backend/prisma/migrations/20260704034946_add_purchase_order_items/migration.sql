-- CreateTable
CREATE TABLE "purchase_orders_items_poi" (
    "id_product_poi" INTEGER NOT NULL,
    "id_purchase_order_poi" INTEGER NOT NULL,
    "quantity_poi" INTEGER NOT NULL DEFAULT 0,
    "price_poi" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_poi" DECIMAL(10,2) NOT NULL,
    "subtotal_poi" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "purchase_orders_items_poi_pkey" PRIMARY KEY ("id_product_poi","id_purchase_order_poi")
);

-- AddForeignKey
ALTER TABLE "purchase_orders_items_poi" ADD CONSTRAINT "purchase_orders_items_poi_id_product_poi_fkey" FOREIGN KEY ("id_product_poi") REFERENCES "products_p"("id_product_p") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_items_poi" ADD CONSTRAINT "purchase_orders_items_poi_id_purchase_order_poi_fkey" FOREIGN KEY ("id_purchase_order_poi") REFERENCES "purchase_orders_po"("id_purchase_orders_po") ON DELETE RESTRICT ON UPDATE CASCADE;
