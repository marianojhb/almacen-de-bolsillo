-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public._prisma_migrations (
  id character varying NOT NULL,
  checksum character varying NOT NULL,
  finished_at timestamp with time zone,
  migration_name character varying NOT NULL,
  logs text,
  rolled_back_at timestamp with time zone,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0,
  CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products_p (
  id_product_p integer NOT NULL DEFAULT nextval('products_p_id_product_p_seq'::regclass),
  sku_p text,
  shortname_p text NOT NULL,
  longname_p text NOT NULL,
  description_p text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  price_p numeric NOT NULL,
  stock_p integer NOT NULL DEFAULT 0,
  stock_min_p integer NOT NULL DEFAULT 0,
  discount_p numeric NOT NULL DEFAULT 0,
  id_category_p integer NOT NULL,
  status_p boolean NOT NULL DEFAULT true,
  CONSTRAINT products_p_pkey PRIMARY KEY (id_product_p),
  CONSTRAINT products_p_id_category_p_fkey FOREIGN KEY (id_category_p) REFERENCES public.categories_c(id_category_c)
);
CREATE TABLE public.categories_c (
  id_category_c integer NOT NULL DEFAULT nextval('categories_c_id_category_c_seq'::regclass),
  name_c text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  description_c text,
  CONSTRAINT categories_c_pkey PRIMARY KEY (id_category_c)
);
CREATE TABLE public.suppliers_s (
  id_supplier_s integer NOT NULL DEFAULT nextval('suppliers_s_id_supplier_s_seq'::regclass),
  name_s text NOT NULL,
  cuit_s text,
  phone_s text,
  email_s text,
  address_s text,
  status_s boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT suppliers_s_pkey PRIMARY KEY (id_supplier_s)
);
CREATE TABLE public.purchase_orders_po (
  id_purchase_orders_po integer NOT NULL DEFAULT nextval('purchase_orders_po_id_purchase_orders_po_seq'::regclass),
  date_po timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_po numeric NOT NULL DEFAULT 0,
  id_supplier_po integer NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT purchase_orders_po_pkey PRIMARY KEY (id_purchase_orders_po),
  CONSTRAINT purchase_orders_po_id_supplier_po_fkey FOREIGN KEY (id_supplier_po) REFERENCES public.suppliers_s(id_supplier_s)
);
CREATE TABLE public.purchase_orders_items_poi (
  id_product_poi integer NOT NULL,
  id_purchase_order_poi integer NOT NULL,
  quantity_poi integer NOT NULL DEFAULT 0,
  price_poi numeric NOT NULL DEFAULT 0,
  discount_poi numeric NOT NULL DEFAULT 0,
  subtotal_poi numeric NOT NULL DEFAULT 0,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT purchase_orders_items_poi_pkey PRIMARY KEY (id_product_poi, id_purchase_order_poi),
  CONSTRAINT purchase_orders_items_poi_id_product_poi_fkey FOREIGN KEY (id_product_poi) REFERENCES public.products_p(id_product_p),
  CONSTRAINT purchase_orders_items_poi_id_purchase_order_poi_fkey FOREIGN KEY (id_purchase_order_poi) REFERENCES public.purchase_orders_po(id_purchase_orders_po)
);
CREATE TABLE public.transactions_t (
  id_transaction_t integer NOT NULL DEFAULT nextval('transactions_t_id_transaction_t_seq'::regclass),
  date_t timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount_t numeric NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  payment_method_t USER-DEFINED NOT NULL DEFAULT 'EFECTIVO'::"PaymentMethod",
  CONSTRAINT transactions_t_pkey PRIMARY KEY (id_transaction_t)
);
CREATE TABLE public.balance_b (
  id_balance_b integer NOT NULL DEFAULT nextval('balance_b_id_balance_b_seq'::regclass),
  date_b timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cash_in_b numeric NOT NULL,
  cash_out_b numeric NOT NULL,
  expected_closing_b numeric NOT NULL,
  actual_closing_b numeric NOT NULL,
  difference_b numeric NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  opening_b numeric NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT balance_b_pkey PRIMARY KEY (id_balance_b)
);
CREATE TABLE public.user_u (
  id_user_u integer NOT NULL DEFAULT nextval('user_u_id_user_u_seq'::regclass),
  username_u text NOT NULL,
  email_u text NOT NULL,
  last_access_u timestamp without time zone NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  is_active_u boolean NOT NULL DEFAULT true,
  role_u USER-DEFINED NOT NULL DEFAULT 'EMPLOYEE'::"Role",
  password_hash_u text NOT NULL,
  CONSTRAINT user_u_pkey PRIMARY KEY (id_user_u)
);
CREATE TABLE public.sales_orders_so (
  id_sales_orders_so integer NOT NULL DEFAULT nextval('sales_orders_so_id_sales_orders_so_seq'::regclass),
  invoice_so text,
  date_so timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discount_so numeric NOT NULL DEFAULT 0,
  iva_so numeric NOT NULL DEFAULT 0,
  total_so numeric NOT NULL DEFAULT 0,
  updated_at timestamp without time zone NOT NULL,
  is_active_so boolean NOT NULL DEFAULT true,
  payment_method_so USER-DEFINED NOT NULL DEFAULT 'EFECTIVO'::"PaymentMethod",
  id_user_so integer NOT NULL,
  CONSTRAINT sales_orders_so_pkey PRIMARY KEY (id_sales_orders_so),
  CONSTRAINT sales_orders_so_id_user_so_fkey FOREIGN KEY (id_user_so) REFERENCES public.user_u(id_user_u)
);
CREATE TABLE public.sales_orders_items_soi (
  id_product_soi integer NOT NULL,
  quantity_soi integer NOT NULL DEFAULT 0,
  shortname_soi text NOT NULL,
  longname_soi text,
  price_soi numeric NOT NULL DEFAULT 0,
  subtotal_soi numeric NOT NULL DEFAULT 0,
  discount_soi numeric NOT NULL DEFAULT 0,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  id_sales_order_soi integer NOT NULL,
  CONSTRAINT sales_orders_items_soi_pkey PRIMARY KEY (id_sales_order_soi, id_product_soi),
  CONSTRAINT sales_orders_items_soi_id_product_soi_fkey FOREIGN KEY (id_product_soi) REFERENCES public.products_p(id_product_p),
  CONSTRAINT sales_orders_items_soi_id_sales_order_soi_fkey FOREIGN KEY (id_sales_order_soi) REFERENCES public.sales_orders_so(id_sales_orders_so)
);
CREATE TABLE public.employee_e (
  id_employee_e integer NOT NULL DEFAULT nextval('employee_e_id_employee_e_seq'::regclass),
  firstname_e text,
  lastname_e text,
  fullname_e text,
  dni_e text,
  cuil_e text,
  dob_e timestamp without time zone,
  salary_e numeric,
  job_title_e text,
  pto_e text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  is_active_e boolean NOT NULL DEFAULT true,
  gender_e USER-DEFINED NOT NULL DEFAULT 'M'::"Gender",
  CONSTRAINT employee_e_pkey PRIMARY KEY (id_employee_e)
);