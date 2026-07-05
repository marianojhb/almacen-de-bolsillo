BEGIN;

-- ============================================================
-- SEED DATA - ALMACÉN EN EL BOLSILLO
-- PostgreSQL / Supabase
-- Compatible con el último esquema enviado
-- ============================================================


-- ============================================================
-- CATEGORÍAS
-- ============================================================

INSERT INTO public.categories_c (
  id_category_c,
  name_c,
  created_at,
  updated_at,
  description_c
) VALUES
  (1, 'Bebidas', NOW(), NOW(), 'Gaseosas, aguas y bebidas listas para consumir'),
  (2, 'Golosinas', NOW(), NOW(), 'Chocolates, caramelos, alfajores y snacks dulces'),
  (3, 'Snacks', NOW(), NOW(), 'Papas fritas, palitos, maní y productos salados'),
  (4, 'Galletitas', NOW(), NOW(), 'Galletitas dulces y saladas de kiosco'),
  (5, 'Lácteos', NOW(), NOW(), 'Leches chocolatadas y productos refrigerados simples'),
  (6, 'Cigarrillos', NOW(), NOW(), 'Productos de tabaquería de venta habitual en kiosco')
ON CONFLICT (id_category_c) DO UPDATE SET
  name_c = EXCLUDED.name_c,
  updated_at = NOW(),
  description_c = EXCLUDED.description_c;


-- ============================================================
-- PRODUCTOS
-- 15 productos de kiosco
-- ============================================================

INSERT INTO public.products_p (
  id_product_p,
  sku_p,
  shortname_p,
  longname_p,
  description_p,
  created_at,
  updated_at,
  price_p,
  stock_p,
  stock_min_p,
  discount_p,
  id_category_p,
  status_p
) VALUES
  (1, 'BEB-COCA-500', 'Coca 500ml', 'Coca-Cola Original 500ml', 'Gaseosa Coca-Cola botella 500ml', NOW(), NOW(), 1800, 35, 8, 0, 1, true),
  (2, 'BEB-SPRITE-500', 'Sprite 500ml', 'Sprite Lima Limón 500ml', 'Gaseosa Sprite botella 500ml', NOW(), NOW(), 1700, 28, 8, 0, 1, true),
  (3, 'BEB-VILLAV-500', 'Villa 500ml', 'Agua Villavicencio 500ml', 'Agua mineral sin gas 500ml', NOW(), NOW(), 1200, 40, 10, 0, 1, true),
  (4, 'BEB-POWERADE-AZUL', 'Powerade Azul', 'Powerade Mountain Blast 500ml', 'Bebida isotónica sabor azul', NOW(), NOW(), 2100, 20, 5, 0, 1, true),

  (5, 'GOL-JORG-BLANCO', 'Jorgito Blanco', 'Alfajor Jorgito Blanco', 'Alfajor simple bañado en chocolate blanco', NOW(), NOW(), 900, 50, 12, 0, 2, true),
  (6, 'GOL-GUAYM-NEGRO', 'Guaymallén Negro', 'Alfajor Guaymallén Chocolate Negro', 'Alfajor clásico económico', NOW(), NOW(), 700, 65, 15, 0, 2, true),
  (7, 'GOL-MOGUL-FRUT', 'Mogul Frutal', 'Mogul Gomitas Frutales', 'Gomitas frutales paquete chico', NOW(), NOW(), 850, 25, 8, 0, 2, true),
  (8, 'GOL-BONOBON', 'Bon o Bon', 'Bombón Bon o Bon Chocolate', 'Bombón relleno clásico', NOW(), NOW(), 500, 80, 20, 0, 2, true),

  (9, 'SNK-LAYS-CHICO', 'Lay''s Chico', 'Papas Fritas Lay''s Clásicas 45g', 'Snack salado paquete chico', NOW(), NOW(), 1600, 22, 6, 0, 3, true),
  (10, 'SNK-DORITOS-CHICO', 'Doritos Chico', 'Doritos Queso 45g', 'Snack de maíz sabor queso', NOW(), NOW(), 1700, 18, 6, 0, 3, true),
  (11, 'SNK-PEHUAMAR-PALITOS', 'Palitos Pehuamar', 'Palitos Salados Pehuamar 80g', 'Palitos salados clásicos', NOW(), NOW(), 1300, 24, 6, 0, 3, true),

  (12, 'GAL-OREO-117', 'Oreo 117g', 'Galletitas Oreo 117g', 'Galletitas dulces rellenas', NOW(), NOW(), 1500, 30, 8, 0, 4, true),
  (13, 'GAL-CRIOLLITAS', 'Criollitas', 'Galletitas Criollitas Original', 'Galletitas saladas clásicas', NOW(), NOW(), 1400, 26, 8, 0, 4, true),

  (14, 'LAC-CINDOR-200', 'Cindor 200ml', 'Leche Chocolatada Cindor 200ml', 'Leche chocolatada individual', NOW(), NOW(), 1300, 32, 8, 0, 5, true),

  (15, 'CIG-MARLBORO-BOX20', 'Marlboro Box', 'Marlboro Red Box 20', 'Atado de cigarrillos Marlboro Red Box 20', NOW(), NOW(), 4200, 15, 5, 0, 6, true)
ON CONFLICT (id_product_p) DO UPDATE SET
  sku_p = EXCLUDED.sku_p,
  shortname_p = EXCLUDED.shortname_p,
  longname_p = EXCLUDED.longname_p,
  description_p = EXCLUDED.description_p,
  updated_at = NOW(),
  price_p = EXCLUDED.price_p,
  stock_p = EXCLUDED.stock_p,
  stock_min_p = EXCLUDED.stock_min_p,
  discount_p = EXCLUDED.discount_p,
  id_category_p = EXCLUDED.id_category_p,
  status_p = EXCLUDED.status_p;


-- ============================================================
-- PROVEEDORES
-- 3 proveedores
-- ============================================================

INSERT INTO public.suppliers_s (
  id_supplier_s,
  name_s,
  cuit_s,
  phone_s,
  email_s,
  address_s,
  status_s,
  created_at,
  updated_at
) VALUES
  (1, 'Distribuidora Norte S.A.', '30-71112223-4', '+54 11 4747-1000', 'ventas@distribuidoranorte.com.ar', 'Av. Márquez 2500, San Isidro', true, NOW(), NOW()),
  (2, 'Mayorista El Cóndor', '30-68889991-7', '+54 11 4723-7788', 'pedidos@elcondor.com.ar', 'Ruta 8 Km 45, Pilar', true, NOW(), NOW()),
  (3, 'Golosinas Argentinas SRL', '30-70222333-1', '+54 11 4655-2020', 'contacto@golosinasargentinas.com.ar', 'Av. Rivadavia 8500, CABA', true, NOW(), NOW())
ON CONFLICT (id_supplier_s) DO UPDATE SET
  name_s = EXCLUDED.name_s,
  cuit_s = EXCLUDED.cuit_s,
  phone_s = EXCLUDED.phone_s,
  email_s = EXCLUDED.email_s,
  address_s = EXCLUDED.address_s,
  status_s = EXCLUDED.status_s,
  updated_at = NOW();


-- ============================================================
-- USUARIOS
-- 3 usuarios de prueba
-- ============================================================

INSERT INTO public.user_u (
  id_user_u,
  username_u,
  email_u,
  last_access_u,
  created_at,
  updated_at,
  is_active_u,
  role_u,
  password_hash_u
) VALUES
  (1, 'admin', 'admin@almacenbolsillo.com', NOW(), NOW(), NOW(), true, 'ADMIN'::"Role", '$2b$10$seed.hash.admin.no.usar.en.produccion000000000000000'),
  (2, 'vendedor1', 'vendedor1@almacenbolsillo.com', NOW(), NOW(), NOW(), true, 'EMPLOYEE'::"Role", '$2b$10$seed.hash.vendedor.no.usar.en.produccion0000000000'),
  (3, 'caja1', 'caja1@almacenbolsillo.com', NOW(), NOW(), NOW(), true, 'EMPLOYEE'::"Role", '$2b$10$seed.hash.caja.no.usar.en.produccion000000000000')
ON CONFLICT (id_user_u) DO UPDATE SET
  username_u = EXCLUDED.username_u,
  email_u = EXCLUDED.email_u,
  last_access_u = EXCLUDED.last_access_u,
  updated_at = NOW(),
  is_active_u = EXCLUDED.is_active_u,
  role_u = EXCLUDED.role_u,
  password_hash_u = EXCLUDED.password_hash_u;


-- ============================================================
-- EMPLEADOS
-- 2 empleados
-- ============================================================

INSERT INTO public.employee_e (
  id_employee_e,
  firstname_e,
  lastname_e,
  fullname_e,
  dni_e,
  cuil_e,
  dob_e,
  salary_e,
  job_title_e,
  pto_e,
  created_at,
  updated_at,
  is_active_e,
  gender_e
) VALUES
  (1, 'Lucía', 'Fernández', 'Lucía Fernández', '38123456', '27-38123456-8', '1994-05-12', 450000, 'Vendedora', 'Mañana', NOW(), NOW(), true, 'F'::"Gender"),
  (2, 'Martín', 'Gómez', 'Martín Gómez', '35222111', '20-35222111-5', '1990-09-23', 520000, 'Encargado de caja', 'Tarde', NOW(), NOW(), true, 'M'::"Gender")
ON CONFLICT (id_employee_e) DO UPDATE SET
  firstname_e = EXCLUDED.firstname_e,
  lastname_e = EXCLUDED.lastname_e,
  fullname_e = EXCLUDED.fullname_e,
  dni_e = EXCLUDED.dni_e,
  cuil_e = EXCLUDED.cuil_e,
  dob_e = EXCLUDED.dob_e,
  salary_e = EXCLUDED.salary_e,
  job_title_e = EXCLUDED.job_title_e,
  pto_e = EXCLUDED.pto_e,
  updated_at = NOW(),
  is_active_e = EXCLUDED.is_active_e,
  gender_e = EXCLUDED.gender_e;


-- ============================================================
-- ÓRDENES DE VENTA
-- 5 ventas
-- ============================================================

INSERT INTO public.sales_orders_so (
  id_sales_orders_so,
  invoice_so,
  date_so,
  created_at,
  discount_so,
  iva_so,
  total_so,
  updated_at,
  is_active_so,
  payment_method_so,
  id_user_so
) VALUES
  (1, 'VTA-0001', NOW() - INTERVAL '5 days', NOW(), 0, 0, 6100, NOW(), true, 'EFECTIVO'::"PaymentMethod", 2),
  (2, 'VTA-0002', NOW() - INTERVAL '4 days', NOW(), 0, 0, 4300, NOW(), true, 'EFECTIVO'::"PaymentMethod", 2),
  (3, 'VTA-0003', NOW() - INTERVAL '3 days', NOW(), 0, 0, 7100, NOW(), true, 'EFECTIVO'::"PaymentMethod", 3),
  (4, 'VTA-0004', NOW() - INTERVAL '2 days', NOW(), 0, 0, 5400, NOW(), true, 'EFECTIVO'::"PaymentMethod", 3),
  (5, 'VTA-0005', NOW() - INTERVAL '1 day', NOW(), 0, 0, 9200, NOW(), true, 'EFECTIVO'::"PaymentMethod", 2)
ON CONFLICT (id_sales_orders_so) DO UPDATE SET
  invoice_so = EXCLUDED.invoice_so,
  date_so = EXCLUDED.date_so,
  discount_so = EXCLUDED.discount_so,
  iva_so = EXCLUDED.iva_so,
  total_so = EXCLUDED.total_so,
  updated_at = NOW(),
  is_active_so = EXCLUDED.is_active_so,
  payment_method_so = EXCLUDED.payment_method_so,
  id_user_so = EXCLUDED.id_user_so;


-- ============================================================
-- DETALLE DE ÓRDENES DE VENTA
-- id_sales_order_soi referencia a sales_orders_so(id_sales_orders_so)
-- ============================================================

INSERT INTO public.sales_orders_items_soi (
  id_sales_order_soi,
  id_product_soi,
  quantity_soi,
  shortname_soi,
  longname_soi,
  price_soi,
  subtotal_soi,
  discount_soi,
  created_at,
  updated_at
) VALUES
  -- Venta 1 total 6100
  (1, 1, 2, 'Coca 500ml', 'Coca-Cola Original 500ml', 1800, 3600, 0, NOW(), NOW()),
  (1, 5, 1, 'Jorgito Blanco', 'Alfajor Jorgito Blanco', 900, 900, 0, NOW(), NOW()),
  (1, 9, 1, 'Lay''s Chico', 'Papas Fritas Lay''s Clásicas 45g', 1600, 1600, 0, NOW(), NOW()),

  -- Venta 2 total 4300
  (2, 3, 1, 'Villa 500ml', 'Agua Villavicencio 500ml', 1200, 1200, 0, NOW(), NOW()),
  (2, 12, 1, 'Oreo 117g', 'Galletitas Oreo 117g', 1500, 1500, 0, NOW(), NOW()),
  (2, 11, 1, 'Palitos Pehuamar', 'Palitos Salados Pehuamar 80g', 1300, 1300, 0, NOW(), NOW()),
  (2, 8, 1, 'Bon o Bon', 'Bombón Bon o Bon Chocolate', 500, 500, 200, NOW(), NOW()),

  -- Venta 3 total 7100
  (3, 15, 1, 'Marlboro Box', 'Marlboro Red Box 20', 4200, 4200, 0, NOW(), NOW()),
  (3, 2, 1, 'Sprite 500ml', 'Sprite Lima Limón 500ml', 1700, 1700, 0, NOW(), NOW()),
  (3, 6, 2, 'Guaymallén Negro', 'Alfajor Guaymallén Chocolate Negro', 700, 1400, 200, NOW(), NOW()),

  -- Venta 4 total 5400
  (4, 4, 1, 'Powerade Azul', 'Powerade Mountain Blast 500ml', 2100, 2100, 0, NOW(), NOW()),
  (4, 10, 1, 'Doritos Chico', 'Doritos Queso 45g', 1700, 1700, 0, NOW(), NOW()),
  (4, 7, 2, 'Mogul Frutal', 'Mogul Gomitas Frutales', 850, 1700, 100, NOW(), NOW()),

  -- Venta 5 total 9200
  (5, 1, 1, 'Coca 500ml', 'Coca-Cola Original 500ml', 1800, 1800, 0, NOW(), NOW()),
  (5, 14, 2, 'Cindor 200ml', 'Leche Chocolatada Cindor 200ml', 1300, 2600, 0, NOW(), NOW()),
  (5, 13, 1, 'Criollitas', 'Galletitas Criollitas Original', 1400, 1400, 0, NOW(), NOW()),
  (5, 15, 1, 'Marlboro Box', 'Marlboro Red Box 20', 4200, 4200, 800, NOW(), NOW())
ON CONFLICT (id_sales_order_soi, id_product_soi) DO UPDATE SET
  quantity_soi = EXCLUDED.quantity_soi,
  shortname_soi = EXCLUDED.shortname_soi,
  longname_soi = EXCLUDED.longname_soi,
  price_soi = EXCLUDED.price_soi,
  subtotal_soi = EXCLUDED.subtotal_soi,
  discount_soi = EXCLUDED.discount_soi,
  updated_at = NOW();


-- ============================================================
-- ÓRDENES / FACTURAS DE COMPRA A PROVEEDORES
-- 3 compras
-- ============================================================

INSERT INTO public.purchase_orders_po (
  id_purchase_orders_po,
  date_po,
  total_po,
  id_supplier_po,
  created_at,
  updated_at
) VALUES
  (1, NOW() - INTERVAL '10 days', 54000, 1, NOW(), NOW()),
  (2, NOW() - INTERVAL '8 days', 39200, 2, NOW(), NOW()),
  (3, NOW() - INTERVAL '6 days', 30600, 3, NOW(), NOW())
ON CONFLICT (id_purchase_orders_po) DO UPDATE SET
  date_po = EXCLUDED.date_po,
  total_po = EXCLUDED.total_po,
  id_supplier_po = EXCLUDED.id_supplier_po,
  updated_at = NOW();


-- ============================================================
-- DETALLE DE COMPRAS
-- ============================================================

INSERT INTO public.purchase_orders_items_poi (
  id_product_poi,
  id_purchase_order_poi,
  quantity_poi,
  price_poi,
  discount_poi,
  subtotal_poi,
  created_at,
  updated_at
) VALUES
  -- Compra 1 total 54000
  (1, 1, 12, 1100, 0, 13200, NOW(), NOW()),
  (2, 1, 12, 1050, 0, 12600, NOW(), NOW()),
  (3, 1, 18, 700, 0, 12600, NOW(), NOW()),
  (4, 1, 8, 1950, 0, 15600, NOW(), NOW()),

  -- Compra 2 total 39200
  (9, 2, 10, 1100, 0, 11000, NOW(), NOW()),
  (10, 2, 8, 1200, 0, 9600, NOW(), NOW()),
  (11, 2, 12, 850, 0, 10200, NOW(), NOW()),
  (13, 2, 8, 1050, 0, 8400, NOW(), NOW()),

  -- Compra 3 total 30600
  (5, 3, 20, 550, 0, 11000, NOW(), NOW()),
  (6, 3, 25, 420, 0, 10500, NOW(), NOW()),
  (7, 3, 10, 550, 0, 5500, NOW(), NOW()),
  (8, 3, 12, 300, 0, 3600, NOW(), NOW())
ON CONFLICT (id_product_poi, id_purchase_order_poi) DO UPDATE SET
  quantity_poi = EXCLUDED.quantity_poi,
  price_poi = EXCLUDED.price_poi,
  discount_poi = EXCLUDED.discount_poi,
  subtotal_poi = EXCLUDED.subtotal_poi,
  updated_at = NOW();


-- ============================================================
-- TRANSACCIONES
-- Ventas positivas, compras negativas.
-- ============================================================

INSERT INTO public.transactions_t (
  id_transaction_t,
  date_t,
  amount_t,
  created_at,
  updated_at,
  payment_method_t
) VALUES
  (1, NOW() - INTERVAL '5 days', 6100, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod"),
  (2, NOW() - INTERVAL '4 days', 4300, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod"),
  (3, NOW() - INTERVAL '3 days', 7100, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod"),
  (4, NOW() - INTERVAL '2 days', 5400, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod"),
  (5, NOW() - INTERVAL '1 day', 9200, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod"),
  (6, NOW() - INTERVAL '10 days', -54000, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod"),
  (7, NOW() - INTERVAL '8 days', -39200, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod"),
  (8, NOW() - INTERVAL '6 days', -30600, NOW(), NOW(), 'EFECTIVO'::"PaymentMethod")
ON CONFLICT (id_transaction_t) DO UPDATE SET
  date_t = EXCLUDED.date_t,
  amount_t = EXCLUDED.amount_t,
  updated_at = NOW(),
  payment_method_t = EXCLUDED.payment_method_t;


-- ============================================================
-- BALANCE SIMPLE
-- ============================================================

INSERT INTO public.balance_b (
  id_balance_b,
  date_b,
  cash_in_b,
  cash_out_b,
  expected_closing_b,
  actual_closing_b,
  difference_b,
  created_at,
  opening_b,
  updated_at
) VALUES
  (1, CURRENT_DATE, 32100, 123800, 8300, 8300, 0, NOW(), 100000, NOW())
ON CONFLICT (id_balance_b) DO UPDATE SET
  date_b = EXCLUDED.date_b,
  cash_in_b = EXCLUDED.cash_in_b,
  cash_out_b = EXCLUDED.cash_out_b,
  expected_closing_b = EXCLUDED.expected_closing_b,
  actual_closing_b = EXCLUDED.actual_closing_b,
  difference_b = EXCLUDED.difference_b,
  opening_b = EXCLUDED.opening_b,
  updated_at = NOW();


-- ============================================================
-- AJUSTE DE SECUENCIAS
-- ============================================================

SELECT setval('categories_c_id_category_c_seq', COALESCE((SELECT MAX(id_category_c) FROM public.categories_c), 1), true);
SELECT setval('products_p_id_product_p_seq', COALESCE((SELECT MAX(id_product_p) FROM public.products_p), 1), true);
SELECT setval('suppliers_s_id_supplier_s_seq', COALESCE((SELECT MAX(id_supplier_s) FROM public.suppliers_s), 1), true);
SELECT setval('purchase_orders_po_id_purchase_orders_po_seq', COALESCE((SELECT MAX(id_purchase_orders_po) FROM public.purchase_orders_po), 1), true);
SELECT setval('user_u_id_user_u_seq', COALESCE((SELECT MAX(id_user_u) FROM public.user_u), 1), true);
SELECT setval('sales_orders_so_id_sales_orders_so_seq', COALESCE((SELECT MAX(id_sales_orders_so) FROM public.sales_orders_so), 1), true);
SELECT setval('employee_e_id_employee_e_seq', COALESCE((SELECT MAX(id_employee_e) FROM public.employee_e), 1), true);
SELECT setval('transactions_t_id_transaction_t_seq', COALESCE((SELECT MAX(id_transaction_t) FROM public.transactions_t), 1), true);
SELECT setval('balance_b_id_balance_b_seq', COALESCE((SELECT MAX(id_balance_b) FROM public.balance_b), 1), true);

COMMIT;