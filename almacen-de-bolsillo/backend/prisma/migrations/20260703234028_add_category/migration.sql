-- CreateTable
CREATE TABLE "categories" (
    "id_category_c" SERIAL NOT NULL,
    "name_c" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id_category_c")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_c_key" ON "categories"("name_c");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_id_category_p_fkey" FOREIGN KEY ("id_category_p") REFERENCES "categories"("id_category_c") ON DELETE RESTRICT ON UPDATE CASCADE;
