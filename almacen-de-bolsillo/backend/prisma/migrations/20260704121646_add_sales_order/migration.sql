-- CreateTable
CREATE TABLE "sales_orders_so" (
    "id_sales_orders_so" SERIAL NOT NULL,
    "invoice_so" TEXT NOT NULL,
    "date_so" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "sales_orders_so_pkey" PRIMARY KEY ("id_sales_orders_so")
);

-- AddForeignKey
ALTER TABLE "sales_orders_so" ADD CONSTRAINT "sales_orders_so_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user_u"("id_user_u") ON DELETE RESTRICT ON UPDATE CASCADE;
