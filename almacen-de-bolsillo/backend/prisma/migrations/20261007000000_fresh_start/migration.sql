-- Base inicial del esquema nuevo: ejecutar únicamente sobre el esquema vacío.
-- No borra datos. Antes de usarla como migración, archivar las migraciones antiguas.
-- La FK CommerceOwner es DEFERRABLE: comercio, rol y dueño se registran juntos.
-- Mantener este ajuste manual al regenerar SQL desde schema.prisma.
BEGIN;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkShiftBreakMode" AS ENUM ('FLEXIBLE', 'FIXED');

-- CreateEnum
CREATE TYPE "WorkShiftStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'SALE', 'MANUAL_ENTRY', 'MANUAL_EXIT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'VIRTUAL_WALLET', 'CREDIT_CARD', 'DEBIT_CARD');

-- CreateEnum
CREATE TYPE "WalletProvider" AS ENUM ('MERCADOPAGO', 'UALA', 'OTHER');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('UNIT', 'BOX', 'KILOGRAM', 'LITER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F', 'OTHER');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "commerces_c" (
    "id_commerce_c" SERIAL NOT NULL,
    "name_c" TEXT NOT NULL,
    "username_c" TEXT NOT NULL,
    "country_c" TEXT NOT NULL,
    "currency_c" TEXT NOT NULL,
    "time_zone_c" TEXT NOT NULL,
    "id_owner_c" INTEGER NOT NULL,
    "sku_enabled_c" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed_c" BOOLEAN NOT NULL DEFAULT false,
    "last_employee_number_c" INTEGER NOT NULL DEFAULT 0,
    "is_active_c" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerces_c_pkey" PRIMARY KEY ("id_commerce_c")
);

-- CreateTable
CREATE TABLE "auth_sessions_as" (
    "id_auth_session_as" SERIAL NOT NULL,
    "token_hash_as" TEXT NOT NULL,
    "id_user_as" INTEGER NOT NULL,
    "expires_at_as" TIMESTAMP(3) NOT NULL,
    "revoked_at_as" TIMESTAMP(3),
    "issued_at_as" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_as_pkey" PRIMARY KEY ("id_auth_session_as")
);

-- CreateTable
CREATE TABLE "commerce_roles_cr" (
    "id_commerce_role_cr" SERIAL NOT NULL,
    "name_cr" TEXT NOT NULL,
    "description_cr" TEXT,
    "id_commerce_cr" INTEGER NOT NULL,
    "is_active_cr" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_roles_cr_pkey" PRIMARY KEY ("id_commerce_role_cr")
);

-- CreateTable
CREATE TABLE "permissions_p" (
    "id_permission_p" SERIAL NOT NULL,
    "code_p" TEXT NOT NULL,
    "name_p" TEXT NOT NULL,
    "description_p" TEXT,

    CONSTRAINT "permissions_p_pkey" PRIMARY KEY ("id_permission_p")
);

-- CreateTable
CREATE TABLE "role_permissions_rp" (
    "id_role_rp" INTEGER NOT NULL,
    "id_permission_rp" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_rp_pkey" PRIMARY KEY ("id_role_rp","id_permission_rp")
);

-- CreateTable
CREATE TABLE "products_p" (
    "id_product_p" SERIAL NOT NULL,
    "sku_p" TEXT,
    "shortname_p" TEXT NOT NULL,
    "longname_p" TEXT NOT NULL,
    "description_p" TEXT,
    "measurement_unit_p" "MeasurementUnit" NOT NULL DEFAULT 'UNIT',
    "price_p" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stock_p" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "stock_min_p" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "discount_p" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "id_category_p" INTEGER NOT NULL,
    "is_active_p" BOOLEAN NOT NULL DEFAULT true,
    "id_commerce_p" INTEGER NOT NULL,

    CONSTRAINT "products_p_pkey" PRIMARY KEY ("id_product_p")
);

-- CreateTable
CREATE TABLE "categories_c" (
    "id_category_c" SERIAL NOT NULL,
    "name_c" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "description_c" TEXT,
    "is_active_c" BOOLEAN NOT NULL DEFAULT true,
    "id_commerce_c" INTEGER NOT NULL,

    CONSTRAINT "categories_c_pkey" PRIMARY KEY ("id_category_c")
);

-- CreateTable
CREATE TABLE "suppliers_s" (
    "id_supplier_s" SERIAL NOT NULL,
    "name_s" TEXT NOT NULL,
    "cuit_s" TEXT,
    "phone_country_code_s" VARCHAR(4),
    "phone_s" TEXT,
    "email_s" TEXT,
    "address_s" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active_s" BOOLEAN NOT NULL DEFAULT true,
    "id_commerce_s" INTEGER NOT NULL,

    CONSTRAINT "suppliers_s_pkey" PRIMARY KEY ("id_supplier_s")
);

-- CreateTable
CREATE TABLE "products_on_suppliers_pos" (
    "id_commerce_pos" INTEGER NOT NULL,
    "price_pos" DECIMAL(12,2),
    "supplierId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "supplier_category_pos" TEXT,
    "units_per_paq_pos" INTEGER DEFAULT 1,
    "price_per_paq_pos" DECIMAL(12,2) NOT NULL,
    "minimum_quantity_pos" DECIMAL(12,3) DEFAULT 1,
    "sales_terms_pos" TEXT,
    "lead_time_days_pos" INTEGER,

    CONSTRAINT "products_on_suppliers_pos_pkey" PRIMARY KEY ("supplierId","productId")
);

-- CreateTable
CREATE TABLE "purchase_orders_po" (
    "id_purchase_order_po" SERIAL NOT NULL,
    "date_po" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_po" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "id_supplier_po" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_user_po" INTEGER NOT NULL,
    "is_active_po" BOOLEAN NOT NULL DEFAULT true,
    "id_transaction_po" INTEGER NOT NULL,
    "iva_purchase_order_po" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "id_commerce_po" INTEGER NOT NULL,

    CONSTRAINT "purchase_orders_po_pkey" PRIMARY KEY ("id_purchase_order_po")
);

-- CreateTable
CREATE TABLE "purchase_orders_items_poi" (
    "id_commerce_poi" INTEGER NOT NULL,
    "id_product_poi" INTEGER NOT NULL,
    "id_purchase_order_poi" INTEGER NOT NULL,
    "measurement_unit_poi" "MeasurementUnit" NOT NULL,
    "quantity_poi" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "price_poi" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_poi" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal_poi" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_items_poi_pkey" PRIMARY KEY ("id_product_poi","id_purchase_order_poi")
);

-- CreateTable
CREATE TABLE "transactions_t" (
    "id_transaction_t" SERIAL NOT NULL,
    "date_t" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount_t" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "payment_method_t" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "wallet_provider_t" "WalletProvider",
    "direction_t" "Direction" NOT NULL,
    "id_commerce_t" INTEGER NOT NULL,

    CONSTRAINT "transactions_t_pkey" PRIMARY KEY ("id_transaction_t")
);

-- CreateTable
CREATE TABLE "balance_b" (
    "id_balance_b" SERIAL NOT NULL,
    "date_b" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cash_in_b" DECIMAL(12,2) NOT NULL,
    "cash_out_b" DECIMAL(12,2) NOT NULL,
    "expected_closing_b" DECIMAL(12,2) NOT NULL,
    "actual_closing_b" DECIMAL(12,2) NOT NULL,
    "difference_b" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opening_b" DECIMAL(12,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_commerce_b" INTEGER NOT NULL,

    CONSTRAINT "balance_b_pkey" PRIMARY KEY ("id_balance_b")
);

-- CreateTable
CREATE TABLE "users_u" (
    "id_user_u" SERIAL NOT NULL,
    "username_u" TEXT NOT NULL,
    "email_u" TEXT NOT NULL,
    "last_access_u" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active_u" BOOLEAN NOT NULL DEFAULT true,
    "password_hash_u" TEXT NOT NULL,
    "id_commerce_u" INTEGER NOT NULL,
    "id_role_u" INTEGER NOT NULL,
    "id_employee_u" INTEGER,

    CONSTRAINT "users_u_pkey" PRIMARY KEY ("id_user_u")
);

-- CreateTable
CREATE TABLE "sales_orders_so" (
    "id_sales_order_so" SERIAL NOT NULL,
    "invoice_so" TEXT,
    "date_so" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_user_so" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discount_so" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "iva_sales_order_so" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active_so" BOOLEAN NOT NULL DEFAULT true,
    "taxable_base_so" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal_so" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_so" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_transaction_so" INTEGER NOT NULL,
    "id_commerce_so" INTEGER NOT NULL,

    CONSTRAINT "sales_orders_so_pkey" PRIMARY KEY ("id_sales_order_so")
);

-- CreateTable
CREATE TABLE "sales_orders_items_soi" (
    "id_commerce_soi" INTEGER NOT NULL,
    "id_sales_order_soi" INTEGER NOT NULL,
    "id_product_soi" INTEGER NOT NULL,
    "measurement_unit_soi" "MeasurementUnit" NOT NULL,
    "quantity_soi" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "shortname_soi" TEXT NOT NULL,
    "longname_soi" TEXT,
    "price_soi" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotal_soi" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_soi" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_items_soi_pkey" PRIMARY KEY ("id_sales_order_soi","id_product_soi")
);

-- CreateTable
CREATE TABLE "employees_e" (
    "id_employee_e" SERIAL NOT NULL,
    "id_employe_commerce_e" INTEGER NOT NULL,
    "firstname_e" TEXT,
    "lastname_e" TEXT,
    "fullname_e" TEXT,
    "dni_e" TEXT,
    "cuil_e" TEXT,
    "dob_e" TIMESTAMP(3),
    "salary_e" DECIMAL(12,2),
    "job_title_e" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active_e" BOOLEAN NOT NULL DEFAULT true,
    "gender_e" "Gender" NOT NULL DEFAULT 'M',
    "id_commerce_e" INTEGER NOT NULL,

    CONSTRAINT "employees_e_pkey" PRIMARY KEY ("id_employee_e")
);

-- CreateTable
CREATE TABLE "work_shift_types_wst" (
    "id_work_shift_type_wst" SERIAL NOT NULL,
    "id_commerce_wst" INTEGER NOT NULL,
    "name_wst" TEXT NOT NULL,
    "icon_wst" TEXT NOT NULL,
    "icon_color_wst" TEXT NOT NULL DEFAULT '#FFFFFF',
    "color_wst" TEXT NOT NULL,
    "is_working_day_wst" BOOLEAN NOT NULL DEFAULT true,
    "start_time_wst" VARCHAR(5),
    "end_time_wst" VARCHAR(5),
    "ends_next_day_wst" BOOLEAN NOT NULL DEFAULT false,
    "late_tolerance_minutes_wst" INTEGER NOT NULL DEFAULT 0,
    "is_active_wst" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_shift_types_wst_pkey" PRIMARY KEY ("id_work_shift_type_wst")
);

-- CreateTable
CREATE TABLE "work_shift_type_breaks_wstb" (
    "id_work_shift_type_break_wstb" SERIAL NOT NULL,
    "id_commerce_wstb" INTEGER NOT NULL,
    "id_work_shift_type_wstb" INTEGER NOT NULL,
    "mode_wstb" "WorkShiftBreakMode" NOT NULL,
    "duration_minutes_wstb" INTEGER,
    "start_time_wstb" VARCHAR(5),
    "end_time_wstb" VARCHAR(5),
    "starts_next_day_wstb" BOOLEAN NOT NULL DEFAULT false,
    "ends_next_day_wstb" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_shift_type_breaks_wstb_pkey" PRIMARY KEY ("id_work_shift_type_break_wstb")
);

-- CreateTable
CREATE TABLE "employee_non_working_days_enwd" (
    "id_non_working_day_enwd" SERIAL NOT NULL,
    "id_commerce_enwd" INTEGER NOT NULL,
    "id_employee_enwd" INTEGER NOT NULL,
    "id_work_shift_type_enwd" INTEGER NOT NULL,
    "date_enwd" DATE NOT NULL,
    "notes_enwd" TEXT,
    "is_active_enwd" BOOLEAN NOT NULL DEFAULT true,
    "id_created_by_enwd" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_non_working_days_enwd_pkey" PRIMARY KEY ("id_non_working_day_enwd")
);

-- CreateTable
CREATE TABLE "work_shifts_ws" (
    "id_work_shift_ws" SERIAL NOT NULL,
    "id_commerce_ws" INTEGER NOT NULL,
    "id_employee_ws" INTEGER NOT NULL,
    "id_work_shift_type_ws" INTEGER NOT NULL,
    "starts_at_ws" TIMESTAMP(3) NOT NULL,
    "ends_at_ws" TIMESTAMP(3) NOT NULL,
    "actual_started_at_ws" TIMESTAMP(3),
    "actual_ended_at_ws" TIMESTAMP(3),
    "status_ws" "WorkShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes_ws" TEXT,
    "id_created_by_ws" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_shifts_ws_pkey" PRIMARY KEY ("id_work_shift_ws")
);

-- CreateTable
CREATE TABLE "work_shift_breaks_wsb" (
    "id_work_shift_break_wsb" SERIAL NOT NULL,
    "id_commerce_wsb" INTEGER NOT NULL,
    "id_work_shift_wsb" INTEGER NOT NULL,
    "mode_wsb" "WorkShiftBreakMode" NOT NULL,
    "duration_minutes_wsb" INTEGER,
    "starts_at_wsb" TIMESTAMP(3),
    "ends_at_wsb" TIMESTAMP(3),
    "actual_started_at_wsb" TIMESTAMP(3),
    "actual_ended_at_wsb" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_shift_breaks_wsb_pkey" PRIMARY KEY ("id_work_shift_break_wsb")
);

-- CreateTable
CREATE TABLE "stock_movements_sm" (
    "id_commerce_sm" INTEGER NOT NULL,
    "id_stockmovement_sm" SERIAL NOT NULL,
    "type_sm" "StockMovementType" NOT NULL,
    "product_id_sm" INTEGER NOT NULL,
    "measurement_unit_sm" "MeasurementUnit" NOT NULL,
    "quantity_sm" DECIMAL(12,3) NOT NULL,
    "previous_stock_sm" DECIMAL(12,3) NOT NULL,
    "new_stock_sm" DECIMAL(12,3) NOT NULL,
    "reason_sm" TEXT,
    "created_at_sm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_sales_order_sm" INTEGER,
    "id_purchase_order_sm" INTEGER,

    CONSTRAINT "stock_movements_sm_pkey" PRIMARY KEY ("id_stockmovement_sm")
);

-- CreateIndex
CREATE UNIQUE INDEX "commerces_c_username_c_key" ON "commerces_c"("username_c");

-- CreateIndex
CREATE UNIQUE INDEX "commerces_c_id_owner_c_key" ON "commerces_c"("id_owner_c");

-- CreateIndex
CREATE UNIQUE INDEX "commerces_c_id_owner_c_id_commerce_c_key" ON "commerces_c"("id_owner_c", "id_commerce_c");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_as_token_hash_as_key" ON "auth_sessions_as"("token_hash_as");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_as_id_user_as_key" ON "auth_sessions_as"("id_user_as");

-- CreateIndex
CREATE INDEX "auth_sessions_as_expires_at_as_idx" ON "auth_sessions_as"("expires_at_as");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_roles_cr_id_commerce_role_cr_id_commerce_cr_key" ON "commerce_roles_cr"("id_commerce_role_cr", "id_commerce_cr");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_roles_cr_id_commerce_cr_name_cr_key" ON "commerce_roles_cr"("id_commerce_cr", "name_cr");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_p_code_p_key" ON "permissions_p"("code_p");

-- CreateIndex
CREATE INDEX "role_permissions_rp_id_permission_rp_idx" ON "role_permissions_rp"("id_permission_rp");

-- CreateIndex
CREATE INDEX "products_p_id_commerce_p_idx" ON "products_p"("id_commerce_p");

-- CreateIndex
CREATE UNIQUE INDEX "products_p_id_product_p_id_commerce_p_key" ON "products_p"("id_product_p", "id_commerce_p");

-- CreateIndex
CREATE UNIQUE INDEX "products_p_id_commerce_p_sku_p_key" ON "products_p"("id_commerce_p", "sku_p");

-- CreateIndex
CREATE INDEX "categories_c_id_commerce_c_idx" ON "categories_c"("id_commerce_c");

-- CreateIndex
CREATE UNIQUE INDEX "categories_c_id_category_c_id_commerce_c_key" ON "categories_c"("id_category_c", "id_commerce_c");

-- CreateIndex
CREATE INDEX "suppliers_s_id_commerce_s_idx" ON "suppliers_s"("id_commerce_s");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_s_id_supplier_s_id_commerce_s_key" ON "suppliers_s"("id_supplier_s", "id_commerce_s");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_s_id_commerce_s_cuit_s_key" ON "suppliers_s"("id_commerce_s", "cuit_s");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_id_transaction_po_key" ON "purchase_orders_po"("id_transaction_po");

-- CreateIndex
CREATE INDEX "purchase_orders_po_id_commerce_po_idx" ON "purchase_orders_po"("id_commerce_po");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_id_purchase_order_po_id_commerce_po_key" ON "purchase_orders_po"("id_purchase_order_po", "id_commerce_po");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_id_transaction_po_id_commerce_po_key" ON "purchase_orders_po"("id_transaction_po", "id_commerce_po");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_items_poi_id_product_poi_id_purchase_order__key" ON "purchase_orders_items_poi"("id_product_poi", "id_purchase_order_poi", "id_commerce_poi");

-- CreateIndex
CREATE INDEX "transactions_t_id_commerce_t_idx" ON "transactions_t"("id_commerce_t");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_t_id_transaction_t_id_commerce_t_key" ON "transactions_t"("id_transaction_t", "id_commerce_t");

-- CreateIndex
CREATE INDEX "balance_b_id_commerce_b_idx" ON "balance_b"("id_commerce_b");

-- CreateIndex
CREATE INDEX "users_u_id_commerce_u_idx" ON "users_u"("id_commerce_u");

-- CreateIndex
CREATE INDEX "users_u_id_role_u_id_commerce_u_idx" ON "users_u"("id_role_u", "id_commerce_u");

-- CreateIndex
CREATE UNIQUE INDEX "users_u_id_user_u_id_commerce_u_key" ON "users_u"("id_user_u", "id_commerce_u");

-- CreateIndex
CREATE UNIQUE INDEX "users_u_id_employee_u_id_commerce_u_key" ON "users_u"("id_employee_u", "id_commerce_u");

-- CreateIndex
CREATE UNIQUE INDEX "users_u_id_commerce_u_username_u_key" ON "users_u"("id_commerce_u", "username_u");

-- CreateIndex
CREATE UNIQUE INDEX "users_u_id_commerce_u_email_u_key" ON "users_u"("id_commerce_u", "email_u");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_so_id_transaction_so_key" ON "sales_orders_so"("id_transaction_so");

-- CreateIndex
CREATE INDEX "sales_orders_so_id_commerce_so_idx" ON "sales_orders_so"("id_commerce_so");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_so_id_sales_order_so_id_commerce_so_key" ON "sales_orders_so"("id_sales_order_so", "id_commerce_so");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_so_id_transaction_so_id_commerce_so_key" ON "sales_orders_so"("id_transaction_so", "id_commerce_so");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_items_soi_id_sales_order_soi_id_product_soi_id_key" ON "sales_orders_items_soi"("id_sales_order_soi", "id_product_soi", "id_commerce_soi");

-- CreateIndex
CREATE INDEX "employees_e_id_commerce_e_idx" ON "employees_e"("id_commerce_e");

-- CreateIndex
CREATE UNIQUE INDEX "employees_e_id_employee_e_id_commerce_e_key" ON "employees_e"("id_employee_e", "id_commerce_e");

-- CreateIndex
CREATE UNIQUE INDEX "employees_e_id_commerce_e_id_employe_commerce_e_key" ON "employees_e"("id_commerce_e", "id_employe_commerce_e");

-- CreateIndex
CREATE UNIQUE INDEX "employees_e_id_commerce_e_dni_e_key" ON "employees_e"("id_commerce_e", "dni_e");

-- CreateIndex
CREATE INDEX "work_shift_types_wst_id_commerce_wst_is_active_wst_idx" ON "work_shift_types_wst"("id_commerce_wst", "is_active_wst");

-- CreateIndex
CREATE UNIQUE INDEX "work_shift_types_wst_id_work_shift_type_wst_id_commerce_wst_key" ON "work_shift_types_wst"("id_work_shift_type_wst", "id_commerce_wst");

-- CreateIndex
CREATE INDEX "work_shift_type_breaks_wstb_id_work_shift_type_wstb_id_comm_idx" ON "work_shift_type_breaks_wstb"("id_work_shift_type_wstb", "id_commerce_wstb");

-- CreateIndex
CREATE INDEX "employee_non_working_days_enwd_id_employee_enwd_id_commerce_idx" ON "employee_non_working_days_enwd"("id_employee_enwd", "id_commerce_enwd", "date_enwd");

-- CreateIndex
CREATE INDEX "employee_non_working_days_enwd_id_commerce_enwd_date_enwd_idx" ON "employee_non_working_days_enwd"("id_commerce_enwd", "date_enwd");

-- CreateIndex
CREATE INDEX "employee_non_working_days_enwd_id_work_shift_type_enwd_id_c_idx" ON "employee_non_working_days_enwd"("id_work_shift_type_enwd", "id_commerce_enwd");

-- CreateIndex
CREATE INDEX "employee_non_working_days_enwd_id_created_by_enwd_idx" ON "employee_non_working_days_enwd"("id_created_by_enwd");

-- CreateIndex
CREATE INDEX "work_shifts_ws_id_commerce_ws_starts_at_ws_idx" ON "work_shifts_ws"("id_commerce_ws", "starts_at_ws");

-- CreateIndex
CREATE INDEX "work_shifts_ws_id_commerce_ws_id_employee_ws_starts_at_ws_idx" ON "work_shifts_ws"("id_commerce_ws", "id_employee_ws", "starts_at_ws");

-- CreateIndex
CREATE INDEX "work_shifts_ws_id_work_shift_type_ws_id_commerce_ws_idx" ON "work_shifts_ws"("id_work_shift_type_ws", "id_commerce_ws");

-- CreateIndex
CREATE INDEX "work_shifts_ws_id_created_by_ws_idx" ON "work_shifts_ws"("id_created_by_ws");

-- CreateIndex
CREATE UNIQUE INDEX "work_shifts_ws_id_work_shift_ws_id_commerce_ws_key" ON "work_shifts_ws"("id_work_shift_ws", "id_commerce_ws");

-- CreateIndex
CREATE INDEX "work_shift_breaks_wsb_id_work_shift_wsb_id_commerce_wsb_idx" ON "work_shift_breaks_wsb"("id_work_shift_wsb", "id_commerce_wsb");

-- CreateIndex
CREATE INDEX "stock_movements_sm_id_commerce_sm_idx" ON "stock_movements_sm"("id_commerce_sm");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_sm_id_sales_order_sm_product_id_sm_key" ON "stock_movements_sm"("id_sales_order_sm", "product_id_sm");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_sm_product_id_sm_id_purchase_order_sm_key" ON "stock_movements_sm"("product_id_sm", "id_purchase_order_sm");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_sm_id_sales_order_sm_product_id_sm_id_comme_key" ON "stock_movements_sm"("id_sales_order_sm", "product_id_sm", "id_commerce_sm");

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_sm_product_id_sm_id_purchase_order_sm_id_co_key" ON "stock_movements_sm"("product_id_sm", "id_purchase_order_sm", "id_commerce_sm");

-- AddForeignKey
ALTER TABLE "commerces_c" ADD CONSTRAINT "commerces_c_id_owner_c_id_commerce_c_fkey" FOREIGN KEY ("id_owner_c", "id_commerce_c") REFERENCES "users_u"("id_user_u", "id_commerce_u") ON DELETE RESTRICT ON UPDATE RESTRICT DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "auth_sessions_as" ADD CONSTRAINT "auth_sessions_as_id_user_as_fkey" FOREIGN KEY ("id_user_as") REFERENCES "users_u"("id_user_u") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_roles_cr" ADD CONSTRAINT "commerce_roles_cr_id_commerce_cr_fkey" FOREIGN KEY ("id_commerce_cr") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions_rp" ADD CONSTRAINT "role_permissions_rp_id_role_rp_fkey" FOREIGN KEY ("id_role_rp") REFERENCES "commerce_roles_cr"("id_commerce_role_cr") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions_rp" ADD CONSTRAINT "role_permissions_rp_id_permission_rp_fkey" FOREIGN KEY ("id_permission_rp") REFERENCES "permissions_p"("id_permission_p") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_p" ADD CONSTRAINT "products_p_id_category_p_id_commerce_p_fkey" FOREIGN KEY ("id_category_p", "id_commerce_p") REFERENCES "categories_c"("id_category_c", "id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_p" ADD CONSTRAINT "products_p_id_commerce_p_fkey" FOREIGN KEY ("id_commerce_p") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_c" ADD CONSTRAINT "categories_c_id_commerce_c_fkey" FOREIGN KEY ("id_commerce_c") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers_s" ADD CONSTRAINT "suppliers_s_id_commerce_s_fkey" FOREIGN KEY ("id_commerce_s") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_on_suppliers_pos" ADD CONSTRAINT "products_on_suppliers_pos_supplierId_id_commerce_pos_fkey" FOREIGN KEY ("supplierId", "id_commerce_pos") REFERENCES "suppliers_s"("id_supplier_s", "id_commerce_s") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_on_suppliers_pos" ADD CONSTRAINT "products_on_suppliers_pos_productId_id_commerce_pos_fkey" FOREIGN KEY ("productId", "id_commerce_pos") REFERENCES "products_p"("id_product_p", "id_commerce_p") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_supplier_po_id_commerce_po_fkey" FOREIGN KEY ("id_supplier_po", "id_commerce_po") REFERENCES "suppliers_s"("id_supplier_s", "id_commerce_s") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_user_po_id_commerce_po_fkey" FOREIGN KEY ("id_user_po", "id_commerce_po") REFERENCES "users_u"("id_user_u", "id_commerce_u") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_transaction_po_id_commerce_po_fkey" FOREIGN KEY ("id_transaction_po", "id_commerce_po") REFERENCES "transactions_t"("id_transaction_t", "id_commerce_t") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_commerce_po_fkey" FOREIGN KEY ("id_commerce_po") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_items_poi" ADD CONSTRAINT "purchase_orders_items_poi_id_product_poi_id_commerce_poi_fkey" FOREIGN KEY ("id_product_poi", "id_commerce_poi") REFERENCES "products_p"("id_product_p", "id_commerce_p") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders_items_poi" ADD CONSTRAINT "purchase_orders_items_poi_id_purchase_order_poi_id_commerc_fkey" FOREIGN KEY ("id_purchase_order_poi", "id_commerce_poi") REFERENCES "purchase_orders_po"("id_purchase_order_po", "id_commerce_po") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions_t" ADD CONSTRAINT "transactions_t_id_commerce_t_fkey" FOREIGN KEY ("id_commerce_t") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_b" ADD CONSTRAINT "balance_b_id_commerce_b_fkey" FOREIGN KEY ("id_commerce_b") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_u" ADD CONSTRAINT "users_u_id_commerce_u_fkey" FOREIGN KEY ("id_commerce_u") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_u" ADD CONSTRAINT "users_u_id_role_u_id_commerce_u_fkey" FOREIGN KEY ("id_role_u", "id_commerce_u") REFERENCES "commerce_roles_cr"("id_commerce_role_cr", "id_commerce_cr") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_u" ADD CONSTRAINT "users_u_id_employee_u_id_commerce_u_fkey" FOREIGN KEY ("id_employee_u", "id_commerce_u") REFERENCES "employees_e"("id_employee_e", "id_commerce_e") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_so" ADD CONSTRAINT "sales_orders_so_id_user_so_id_commerce_so_fkey" FOREIGN KEY ("id_user_so", "id_commerce_so") REFERENCES "users_u"("id_user_u", "id_commerce_u") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_so" ADD CONSTRAINT "sales_orders_so_id_transaction_so_id_commerce_so_fkey" FOREIGN KEY ("id_transaction_so", "id_commerce_so") REFERENCES "transactions_t"("id_transaction_t", "id_commerce_t") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_so" ADD CONSTRAINT "sales_orders_so_id_commerce_so_fkey" FOREIGN KEY ("id_commerce_so") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_items_soi" ADD CONSTRAINT "sales_orders_items_soi_id_product_soi_id_commerce_soi_fkey" FOREIGN KEY ("id_product_soi", "id_commerce_soi") REFERENCES "products_p"("id_product_p", "id_commerce_p") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_items_soi" ADD CONSTRAINT "sales_orders_items_soi_id_sales_order_soi_id_commerce_soi_fkey" FOREIGN KEY ("id_sales_order_soi", "id_commerce_soi") REFERENCES "sales_orders_so"("id_sales_order_so", "id_commerce_so") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_e" ADD CONSTRAINT "employees_e_id_commerce_e_fkey" FOREIGN KEY ("id_commerce_e") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shift_types_wst" ADD CONSTRAINT "work_shift_types_wst_id_commerce_wst_fkey" FOREIGN KEY ("id_commerce_wst") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shift_type_breaks_wstb" ADD CONSTRAINT "work_shift_type_breaks_wstb_id_work_shift_type_wstb_id_com_fkey" FOREIGN KEY ("id_work_shift_type_wstb", "id_commerce_wstb") REFERENCES "work_shift_types_wst"("id_work_shift_type_wst", "id_commerce_wst") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "employee_non_working_days_enwd" ADD CONSTRAINT "employee_non_working_days_enwd_id_commerce_enwd_fkey" FOREIGN KEY ("id_commerce_enwd") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_non_working_days_enwd" ADD CONSTRAINT "employee_non_working_days_enwd_id_employee_enwd_id_commerc_fkey" FOREIGN KEY ("id_employee_enwd", "id_commerce_enwd") REFERENCES "employees_e"("id_employee_e", "id_commerce_e") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "employee_non_working_days_enwd" ADD CONSTRAINT "employee_non_working_days_enwd_id_work_shift_type_enwd_id__fkey" FOREIGN KEY ("id_work_shift_type_enwd", "id_commerce_enwd") REFERENCES "work_shift_types_wst"("id_work_shift_type_wst", "id_commerce_wst") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "employee_non_working_days_enwd" ADD CONSTRAINT "employee_non_working_days_enwd_id_created_by_enwd_id_comme_fkey" FOREIGN KEY ("id_created_by_enwd", "id_commerce_enwd") REFERENCES "users_u"("id_user_u", "id_commerce_u") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts_ws" ADD CONSTRAINT "work_shifts_ws_id_commerce_ws_fkey" FOREIGN KEY ("id_commerce_ws") REFERENCES "commerces_c"("id_commerce_c") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts_ws" ADD CONSTRAINT "work_shifts_ws_id_employee_ws_id_commerce_ws_fkey" FOREIGN KEY ("id_employee_ws", "id_commerce_ws") REFERENCES "employees_e"("id_employee_e", "id_commerce_e") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts_ws" ADD CONSTRAINT "work_shifts_ws_id_created_by_ws_id_commerce_ws_fkey" FOREIGN KEY ("id_created_by_ws", "id_commerce_ws") REFERENCES "users_u"("id_user_u", "id_commerce_u") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts_ws" ADD CONSTRAINT "work_shifts_ws_id_work_shift_type_ws_id_commerce_ws_fkey" FOREIGN KEY ("id_work_shift_type_ws", "id_commerce_ws") REFERENCES "work_shift_types_wst"("id_work_shift_type_wst", "id_commerce_wst") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "work_shift_breaks_wsb" ADD CONSTRAINT "work_shift_breaks_wsb_id_work_shift_wsb_id_commerce_wsb_fkey" FOREIGN KEY ("id_work_shift_wsb", "id_commerce_wsb") REFERENCES "work_shifts_ws"("id_work_shift_ws", "id_commerce_ws") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "stock_movements_sm" ADD CONSTRAINT "stock_movements_sm_product_id_sm_id_commerce_sm_fkey" FOREIGN KEY ("product_id_sm", "id_commerce_sm") REFERENCES "products_p"("id_product_p", "id_commerce_p") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements_sm" ADD CONSTRAINT "stock_movements_sm_id_sales_order_sm_product_id_sm_id_comm_fkey" FOREIGN KEY ("id_sales_order_sm", "product_id_sm", "id_commerce_sm") REFERENCES "sales_orders_items_soi"("id_sales_order_soi", "id_product_soi", "id_commerce_soi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements_sm" ADD CONSTRAINT "stock_movements_sm_product_id_sm_id_purchase_order_sm_id_c_fkey" FOREIGN KEY ("product_id_sm", "id_purchase_order_sm", "id_commerce_sm") REFERENCES "purchase_orders_items_poi"("id_product_poi", "id_purchase_order_poi", "id_commerce_poi") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
