BEGIN;

-- ============================================================================
-- SEED DE DEMOSTRACIÓN — ALMACÉN DE BOLSILLO
-- PostgreSQL / Supabase
-- Requiere que todas las migraciones Prisma estén aplicadas.
--
-- Seguridad:
--   - El script aborta si detecta datos de negocio existentes.
--   - No ejecuta TRUNCATE ni elimina información.
--   - Cambiar las contraseñas inmediatamente si se usa fuera de un entorno demo.
--
-- Credenciales:
--   owner@almacendebolsillo.test    / Owner123!
--   empleado@almacendebolsillo.test / Empleado123!
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public."users_u" LIMIT 1)
    OR EXISTS (SELECT 1 FROM public."products_p" LIMIT 1)
    OR EXISTS (SELECT 1 FROM public."suppliers_s" LIMIT 1)
    OR EXISTS (SELECT 1 FROM public."purchase_orders_po" LIMIT 1)
    OR EXISTS (SELECT 1 FROM public."sales_orders_so" LIMIT 1)
    OR EXISTS (SELECT 1 FROM public."balance_b" LIMIT 1)
  THEN
    RAISE EXCEPTION 'Seed cancelado: la base contiene datos. Ejecutarlo únicamente sobre una base vacía.';
  END IF;
END $$;

-- ============================================================================
-- USUARIOS Y EMPLEADOS
-- ============================================================================

INSERT INTO public."users_u" (
  "id_user_u",
  "email_u",
  "last_access_u",
  "created_at",
  "updated_at",
  "is_active_u",
  "password_hash_u",
  "role_u"
) VALUES
  (
    1,
    'owner@almacendebolsillo.test',
    NULL,
    NOW(),
    NOW(),
    TRUE,
    'scrypt-v1:2126895fcf9a4b35b4a39651f7b77e8a:66f14b371e930955d6f4a30d1b64ee37c266dc85c35969f467b4269636a865dcc4d38f8a1b01b5c0f3432b99889d687bf96a6bef71baae73c2c8c8e86acc621c',
    'BUSINESS_OWNER'::"Role"
  ),
  (
    2,
    'empleado@almacendebolsillo.test',
    NULL,
    NOW(),
    NOW(),
    TRUE,
    'scrypt-v1:ed58e153cf56e4f5219c47f1485c34f4:e233a883b8496a1ff4f7cde13ed0d34807f982d3fb5f9cec7158213c8ef61acbe9728b6a1567a4e3dde3b65abb1da7843c54b42ba901fdabd9e0e51e05c52e22',
    'EMPLOYEE'::"Role"
  );

INSERT INTO public."employees_e" (
  "id_employee_e",
  "firstname_e",
  "lastname_e",
  "fullname_e",
  "dni_e",
  "cuil_e",
  "dob_e",
  "salary_e",
  "job_title_e",
  "created_at",
  "updated_at",
  "is_active_e",
  "gender_e",
  "id_user_e"
) VALUES
  (1, 'Marina', 'Dueña', 'Marina Dueña', '30111222', '27-30111222-8', DATE '1983-04-18', 0.00, 'Propietaria', NOW(), NOW(), TRUE, 'F'::"Gender", 1),
  (2, 'Lucas', 'Empleado', 'Lucas Empleado', '40222333', '20-40222333-5', DATE '1997-09-12', 650000.00, 'Vendedor', NOW(), NOW(), TRUE, 'M'::"Gender", 2);

-- ============================================================================
-- CATEGORÍAS
-- ============================================================================

INSERT INTO public."categories_c" (
  "id_category_c",
  "name_c",
  "created_at",
  "updated_at",
  "description_c",
  "is_active_c"
) VALUES
  (1, 'Bebidas', NOW(), NOW(), 'Bebidas sin alcohol y energizantes', TRUE),
  (2, 'Almacén', NOW(), NOW(), 'Productos básicos de despensa', TRUE),
  (3, 'Golosinas', NOW(), NOW(), 'Dulces, chocolates y galletitas', TRUE),
  (4, 'Limpieza', NOW(), NOW(), 'Artículos de limpieza e higiene del hogar', TRUE);

-- ============================================================================
-- PROVEEDORES
-- ============================================================================

INSERT INTO public."suppliers_s" (
  "id_supplier_s",
  "name_s",
  "cuit_s",
  "phone_s",
  "email_s",
  "address_s",
  "created_at",
  "updated_at",
  "is_active_s"
) VALUES
  (1, 'Distribuidora Río de la Plata', '30-71112223-4', '+54 11 4555-1001', 'ventas@riodelaplata.test', 'Av. San Martín 2450, CABA', NOW(), NOW(), TRUE),
  (2, 'Mayorista La Esquina', '30-72223334-5', '+54 11 4555-1002', 'pedidos@laesquina.test', 'Ruta 8 Km 42, Pilar', NOW(), NOW(), TRUE),
  (3, 'Dulce Sur SRL', '30-73334445-6', '+54 11 4555-1003', 'comercial@dulcesur.test', 'Av. Hipólito Yrigoyen 7800, Banfield', NOW(), NOW(), TRUE),
  (4, 'Hogar Limpio Distribuciones', '30-74445556-7', '+54 11 4555-1004', 'pedidos@hogarlimpio.test', 'Camino General Belgrano 3100, Quilmes', NOW(), NOW(), TRUE);

-- ============================================================================
-- PRODUCTOS
-- Cinco productos por proveedor. El stock representa las compras menos ventas
-- incluidas más abajo.
-- ============================================================================

INSERT INTO public."products_p" (
  "id_product_p",
  "sku_p",
  "shortname_p",
  "longname_p",
  "description_p",
  "price_p",
  "created_at",
  "updated_at",
  "stock_p",
  "stock_min_p",
  "discount_p",
  "id_category_p",
  "is_active_p"
) VALUES
  (1, 'BEB-COCA-500', 'Coca-Cola 500 ml', 'Coca-Cola Original 500 ml', 'Gaseosa individual', 2000.00, NOW(), NOW(), 22, 6, 0.00, 1, TRUE),
  (2, 'BEB-SPRITE-500', 'Sprite 500 ml', 'Sprite Lima Limón 500 ml', 'Gaseosa individual', 1900.00, NOW(), NOW(), 23, 6, 0.00, 1, TRUE),
  (3, 'BEB-AGUA-500', 'Agua 500 ml', 'Agua mineral sin gas 500 ml', 'Agua mineral individual', 1100.00, NOW(), NOW(), 28, 8, 0.00, 1, TRUE),
  (4, 'BEB-JUGO-1L', 'Jugo 1 L', 'Jugo de naranja 1 litro', 'Bebida sabor naranja', 1600.00, NOW(), NOW(), 20, 5, 0.00, 1, TRUE),
  (5, 'BEB-ENERG-473', 'Energizante 473 ml', 'Bebida energizante 473 ml', 'Lata de bebida energizante', 2800.00, NOW(), NOW(), 12, 4, 0.00, 1, TRUE),

  (6, 'ALM-ARROZ-1K', 'Arroz 1 kg', 'Arroz largo fino 1 kg', 'Arroz en paquete', 1700.00, NOW(), NOW(), 19, 5, 0.00, 2, TRUE),
  (7, 'ALM-FIDEOS-500', 'Fideos 500 g', 'Fideos secos 500 g', 'Pasta seca', 1500.00, NOW(), NOW(), 19, 5, 0.00, 2, TRUE),
  (8, 'ALM-ACEITE-900', 'Aceite 900 ml', 'Aceite de girasol 900 ml', 'Aceite comestible', 3200.00, NOW(), NOW(), 11, 4, 0.00, 2, TRUE),
  (9, 'ALM-YERBA-1K', 'Yerba 1 kg', 'Yerba mate tradicional 1 kg', 'Yerba mate', 4800.00, NOW(), NOW(), 9, 3, 0.00, 2, TRUE),
  (10, 'ALM-AZUCAR-1K', 'Azúcar 1 kg', 'Azúcar común tipo A 1 kg', 'Azúcar en paquete', 1600.00, NOW(), NOW(), 19, 5, 0.00, 2, TRUE),

  (11, 'GOL-ALFAJOR', 'Alfajor', 'Alfajor de chocolate', 'Alfajor simple', 800.00, NOW(), NOW(), 28, 8, 0.00, 3, TRUE),
  (12, 'GOL-CHOC-50', 'Chocolate 50 g', 'Chocolate con leche 50 g', 'Tableta individual', 1400.00, NOW(), NOW(), 19, 5, 0.00, 3, TRUE),
  (13, 'GOL-CARAMELOS', 'Caramelos 100 g', 'Caramelos surtidos 100 g', 'Bolsa de caramelos surtidos', 1000.00, NOW(), NOW(), 25, 6, 0.00, 3, TRUE),
  (14, 'GOL-GOMITAS', 'Gomitas 100 g', 'Gomitas frutales 100 g', 'Bolsa de gomitas', 1200.00, NOW(), NOW(), 18, 5, 0.00, 3, TRUE),
  (15, 'GOL-GALLETITAS', 'Galletitas', 'Galletitas rellenas 120 g', 'Paquete de galletitas', 1700.00, NOW(), NOW(), 17, 5, 0.00, 3, TRUE),

  (16, 'LIM-DETERG-500', 'Detergente 500 ml', 'Detergente concentrado 500 ml', 'Detergente para vajilla', 2100.00, NOW(), NOW(), 11, 4, 0.00, 4, TRUE),
  (17, 'LIM-LAVAND-1L', 'Lavandina 1 L', 'Lavandina concentrada 1 litro', 'Lavandina para el hogar', 1400.00, NOW(), NOW(), 14, 4, 0.00, 4, TRUE),
  (18, 'LIM-PAPEL-X4', 'Papel higiénico x4', 'Papel higiénico paquete por 4', 'Papel higiénico doble hoja', 3500.00, NOW(), NOW(), 9, 3, 0.00, 4, TRUE),
  (19, 'LIM-JABON-250', 'Jabón líquido 250 ml', 'Jabón líquido para manos 250 ml', 'Jabón líquido', 1700.00, NOW(), NOW(), 15, 4, 0.00, 4, TRUE),
  (20, 'LIM-ESPONJA', 'Esponja', 'Esponja multiuso', 'Esponja para vajilla', 900.00, NOW(), NOW(), 18, 5, 0.00, 4, TRUE);

-- ============================================================================
-- CATÁLOGO Y PRECIOS DE PROVEEDORES
-- price_pos: precio unitario de costo.
-- price_per_paq_pos: precio del paquete informado por el proveedor.
-- ============================================================================

INSERT INTO public."products_on_suppliers_pos" (
  "supplierId",
  "productId",
  "price_pos",
  "supplier_category_pos",
  "units_per_paq_pos",
  "price_per_paq_pos",
  "minimum_quantity_pos",
  "sales_terms_pos",
  "lead_time_days_pos"
) VALUES
  (1, 1, 1400.00, 'Gaseosas', 6, 8400.00, 6, 'Contado', 2),
  (1, 2, 1350.00, 'Gaseosas', 6, 8100.00, 6, 'Contado', 2),
  (1, 3, 700.00, 'Aguas', 6, 4200.00, 6, 'Contado', 2),
  (1, 4, 850.00, 'Jugos', 6, 5100.00, 6, 'Contado', 2),
  (1, 5, 1800.00, 'Energizantes', 6, 10800.00, 6, 'Contado', 2),

  (2, 6, 1100.00, 'Arroz', 10, 11000.00, 10, '7 días', 3),
  (2, 7, 900.00, 'Pastas', 10, 9000.00, 10, '7 días', 3),
  (2, 8, 2200.00, 'Aceites', 6, 13200.00, 6, '7 días', 3),
  (2, 9, 3500.00, 'Infusiones', 5, 17500.00, 5, '7 días', 3),
  (2, 10, 1000.00, 'Azúcar', 10, 10000.00, 10, '7 días', 3),

  (3, 11, 500.00, 'Alfajores', 12, 6000.00, 12, 'Contado', 1),
  (3, 12, 900.00, 'Chocolates', 10, 9000.00, 10, 'Contado', 1),
  (3, 13, 600.00, 'Caramelos', 10, 6000.00, 10, 'Contado', 1),
  (3, 14, 750.00, 'Gomitas', 10, 7500.00, 10, 'Contado', 1),
  (3, 15, 1100.00, 'Galletitas', 6, 6600.00, 6, 'Contado', 1),

  (4, 16, 1300.00, 'Cocina', 6, 7800.00, 6, '15 días', 4),
  (4, 17, 800.00, 'Desinfección', 6, 4800.00, 6, '15 días', 4),
  (4, 18, 2200.00, 'Papeles', 4, 8800.00, 4, '15 días', 4),
  (4, 19, 950.00, 'Higiene', 6, 5700.00, 6, '15 días', 4),
  (4, 20, 500.00, 'Cocina', 12, 6000.00, 12, '15 días', 4);

-- ============================================================================
-- TRANSACCIONES DE COMPRAS
-- ============================================================================

INSERT INTO public."transactions_t" (
  "id_transaction_t",
  "date_t",
  "amount_t",
  "created_at",
  "updated_at",
  "payment_method_t",
  "direction_t"
) VALUES
  (1, NOW() - INTERVAL '20 days', 125600.00, NOW() - INTERVAL '20 days', NOW(), 'EFECTIVO'::"PaymentMethod", 'EXPENSE'::"Direction"),
  (2, NOW() - INTERVAL '19 days', 121400.00, NOW() - INTERVAL '19 days', NOW(), 'EFECTIVO'::"PaymentMethod", 'EXPENSE'::"Direction"),
  (3, NOW() - INTERVAL '18 days', 82800.00, NOW() - INTERVAL '18 days', NOW(), 'EFECTIVO'::"PaymentMethod", 'EXPENSE'::"Direction"),
  (4, NOW() - INTERVAL '17 days', 73850.00, NOW() - INTERVAL '17 days', NOW(), 'EFECTIVO'::"PaymentMethod", 'EXPENSE'::"Direction");

INSERT INTO public."purchase_orders_po" (
  "id_purchase_order_po",
  "date_po",
  "total_po",
  "id_supplier_po",
  "created_at",
  "updated_at",
  "id_user_po",
  "is_active_po",
  "id_transaction_po",
  "iva_purchase_order_po"
) VALUES
  (1, NOW() - INTERVAL '20 days', 125600.00, 1, NOW() - INTERVAL '20 days', NOW(), 1, TRUE, 1, 0.00),
  (2, NOW() - INTERVAL '19 days', 121400.00, 2, NOW() - INTERVAL '19 days', NOW(), 1, TRUE, 2, 0.00),
  (3, NOW() - INTERVAL '18 days', 82800.00, 3, NOW() - INTERVAL '18 days', NOW(), 1, TRUE, 3, 0.00),
  (4, NOW() - INTERVAL '17 days', 73850.00, 4, NOW() - INTERVAL '17 days', NOW(), 1, TRUE, 4, 0.00);

INSERT INTO public."purchase_orders_items_poi" (
  "id_product_poi",
  "id_purchase_order_poi",
  "quantity_poi",
  "price_poi",
  "discount_poi",
  "subtotal_poi",
  "created_at",
  "updated_at"
) VALUES
  (1, 1, 24, 1400.00, 0.00, 33600.00, NOW() - INTERVAL '20 days', NOW()),
  (2, 1, 24, 1350.00, 0.00, 32400.00, NOW() - INTERVAL '20 days', NOW()),
  (3, 1, 30, 700.00, 0.00, 21000.00, NOW() - INTERVAL '20 days', NOW()),
  (4, 1, 20, 850.00, 0.00, 17000.00, NOW() - INTERVAL '20 days', NOW()),
  (5, 1, 12, 1800.00, 0.00, 21600.00, NOW() - INTERVAL '20 days', NOW()),

  (6, 2, 20, 1100.00, 0.00, 22000.00, NOW() - INTERVAL '19 days', NOW()),
  (7, 2, 20, 900.00, 0.00, 18000.00, NOW() - INTERVAL '19 days', NOW()),
  (8, 2, 12, 2200.00, 0.00, 26400.00, NOW() - INTERVAL '19 days', NOW()),
  (9, 2, 10, 3500.00, 0.00, 35000.00, NOW() - INTERVAL '19 days', NOW()),
  (10, 2, 20, 1000.00, 0.00, 20000.00, NOW() - INTERVAL '19 days', NOW()),

  (11, 3, 30, 500.00, 0.00, 15000.00, NOW() - INTERVAL '18 days', NOW()),
  (12, 3, 20, 900.00, 0.00, 18000.00, NOW() - INTERVAL '18 days', NOW()),
  (13, 3, 25, 600.00, 0.00, 15000.00, NOW() - INTERVAL '18 days', NOW()),
  (14, 3, 20, 750.00, 0.00, 15000.00, NOW() - INTERVAL '18 days', NOW()),
  (15, 3, 18, 1100.00, 0.00, 19800.00, NOW() - INTERVAL '18 days', NOW()),

  (16, 4, 12, 1300.00, 0.00, 15600.00, NOW() - INTERVAL '17 days', NOW()),
  (17, 4, 15, 800.00, 0.00, 12000.00, NOW() - INTERVAL '17 days', NOW()),
  (18, 4, 10, 2200.00, 0.00, 22000.00, NOW() - INTERVAL '17 days', NOW()),
  (19, 4, 15, 950.00, 0.00, 14250.00, NOW() - INTERVAL '17 days', NOW()),
  (20, 4, 20, 500.00, 0.00, 10000.00, NOW() - INTERVAL '17 days', NOW());

-- ============================================================================
-- TRANSACCIONES Y ÓRDENES DE VENTA
-- Incluye efectivo, Mercado Pago y Ualá para probar caja y rentabilidad.
-- ============================================================================

INSERT INTO public."transactions_t" (
  "id_transaction_t",
  "date_t",
  "amount_t",
  "created_at",
  "updated_at",
  "payment_method_t",
  "direction_t"
) VALUES
  (5, NOW() - INTERVAL '10 days', 7300.00, NOW() - INTERVAL '10 days', NOW(), 'EFECTIVO'::"PaymentMethod", 'INCOME'::"Direction"),
  (6, NOW() - INTERVAL '9 days', 5000.00, NOW() - INTERVAL '9 days', NOW(), 'MERCADOPAGO'::"PaymentMethod", 'INCOME'::"Direction"),
  (7, NOW() - INTERVAL '8 days', 6100.00, NOW() - INTERVAL '8 days', NOW(), 'UALA'::"PaymentMethod", 'INCOME'::"Direction"),
  (8, NOW() - INTERVAL '7 days', 9600.00, NOW() - INTERVAL '7 days', NOW(), 'EFECTIVO'::"PaymentMethod", 'INCOME'::"Direction"),
  (9, NOW() - INTERVAL '6 days', 8800.00, NOW() - INTERVAL '6 days', NOW(), 'MERCADOPAGO'::"PaymentMethod", 'INCOME'::"Direction");

INSERT INTO public."sales_orders_so" (
  "id_sales_order_so",
  "invoice_so",
  "date_so",
  "id_user_so",
  "created_at",
  "discount_so",
  "iva_sales_order_so",
  "is_active_so",
  "taxable_base_so",
  "subtotal_so",
  "total_so",
  "updated_at",
  "payment_method_so",
  "id_transaction_so"
) VALUES
  (1, 'SEED-VTA-0001', NOW() - INTERVAL '10 days', 2, NOW() - INTERVAL '10 days', 0.00, 1266.94, TRUE, 6033.06, 7300.00, 7300.00, NOW(), 'EFECTIVO'::"PaymentMethod", 5),
  (2, 'SEED-VTA-0002', NOW() - INTERVAL '9 days', 2, NOW() - INTERVAL '9 days', 0.00, 867.77, TRUE, 4132.23, 5000.00, 5000.00, NOW(), 'MERCADOPAGO'::"PaymentMethod", 6),
  (3, 'SEED-VTA-0003', NOW() - INTERVAL '8 days', 2, NOW() - INTERVAL '8 days', 0.00, 1058.68, TRUE, 5041.32, 6100.00, 6100.00, NOW(), 'UALA'::"PaymentMethod", 7),
  (4, 'SEED-VTA-0004', NOW() - INTERVAL '7 days', 2, NOW() - INTERVAL '7 days', 0.00, 1666.12, TRUE, 7933.88, 9600.00, 9600.00, NOW(), 'EFECTIVO'::"PaymentMethod", 8),
  (5, 'SEED-VTA-0005', NOW() - INTERVAL '6 days', 2, NOW() - INTERVAL '6 days', 0.00, 1527.27, TRUE, 7272.73, 8800.00, 8800.00, NOW(), 'MERCADOPAGO'::"PaymentMethod", 9);

INSERT INTO public."sales_orders_items_soi" (
  "id_sales_order_soi",
  "id_product_soi",
  "quantity_soi",
  "shortname_soi",
  "longname_soi",
  "price_soi",
  "subtotal_soi",
  "discount_soi",
  "created_at",
  "updated_at"
) VALUES
  (1, 1, 2, 'Coca-Cola 500 ml', 'Coca-Cola Original 500 ml', 2000.00, 4000.00, 0.00, NOW() - INTERVAL '10 days', NOW()),
  (1, 11, 2, 'Alfajor', 'Alfajor de chocolate', 800.00, 1600.00, 0.00, NOW() - INTERVAL '10 days', NOW()),
  (1, 15, 1, 'Galletitas', 'Galletitas rellenas 120 g', 1700.00, 1700.00, 0.00, NOW() - INTERVAL '10 days', NOW()),

  (2, 2, 1, 'Sprite 500 ml', 'Sprite Lima Limón 500 ml', 1900.00, 1900.00, 0.00, NOW() - INTERVAL '9 days', NOW()),
  (2, 6, 1, 'Arroz 1 kg', 'Arroz largo fino 1 kg', 1700.00, 1700.00, 0.00, NOW() - INTERVAL '9 days', NOW()),
  (2, 12, 1, 'Chocolate 50 g', 'Chocolate con leche 50 g', 1400.00, 1400.00, 0.00, NOW() - INTERVAL '9 days', NOW()),

  (3, 3, 2, 'Agua 500 ml', 'Agua mineral sin gas 500 ml', 1100.00, 2200.00, 0.00, NOW() - INTERVAL '8 days', NOW()),
  (3, 7, 1, 'Fideos 500 g', 'Fideos secos 500 g', 1500.00, 1500.00, 0.00, NOW() - INTERVAL '8 days', NOW()),
  (3, 14, 2, 'Gomitas 100 g', 'Gomitas frutales 100 g', 1200.00, 2400.00, 0.00, NOW() - INTERVAL '8 days', NOW()),

  (4, 8, 1, 'Aceite 900 ml', 'Aceite de girasol 900 ml', 3200.00, 3200.00, 0.00, NOW() - INTERVAL '7 days', NOW()),
  (4, 9, 1, 'Yerba 1 kg', 'Yerba mate tradicional 1 kg', 4800.00, 4800.00, 0.00, NOW() - INTERVAL '7 days', NOW()),
  (4, 10, 1, 'Azúcar 1 kg', 'Azúcar común tipo A 1 kg', 1600.00, 1600.00, 0.00, NOW() - INTERVAL '7 days', NOW()),

  (5, 16, 1, 'Detergente 500 ml', 'Detergente concentrado 500 ml', 2100.00, 2100.00, 0.00, NOW() - INTERVAL '6 days', NOW()),
  (5, 17, 1, 'Lavandina 1 L', 'Lavandina concentrada 1 litro', 1400.00, 1400.00, 0.00, NOW() - INTERVAL '6 days', NOW()),
  (5, 18, 1, 'Papel higiénico x4', 'Papel higiénico paquete por 4', 3500.00, 3500.00, 0.00, NOW() - INTERVAL '6 days', NOW()),
  (5, 20, 2, 'Esponja', 'Esponja multiuso', 900.00, 1800.00, 0.00, NOW() - INTERVAL '6 days', NOW());

-- ============================================================================
-- MOVIMIENTOS DE STOCK
-- ============================================================================

INSERT INTO public."stock_movements_sm" (
  "id_stockmovement_sm",
  "type_sm",
  "product_id_sm",
  "quantity_sm",
  "previous_stock_sm",
  "new_stock_sm",
  "reason_sm",
  "created_at_sm",
  "id_sales_order_sm",
  "id_purchase_order_sm"
) VALUES
  (1, 'PURCHASE'::"StockMovementType", 1, 24, 0, 24, 'Compra inicial #1', NOW() - INTERVAL '20 days', NULL, 1),
  (2, 'PURCHASE'::"StockMovementType", 2, 24, 0, 24, 'Compra inicial #1', NOW() - INTERVAL '20 days', NULL, 1),
  (3, 'PURCHASE'::"StockMovementType", 3, 30, 0, 30, 'Compra inicial #1', NOW() - INTERVAL '20 days', NULL, 1),
  (4, 'PURCHASE'::"StockMovementType", 4, 20, 0, 20, 'Compra inicial #1', NOW() - INTERVAL '20 days', NULL, 1),
  (5, 'PURCHASE'::"StockMovementType", 5, 12, 0, 12, 'Compra inicial #1', NOW() - INTERVAL '20 days', NULL, 1),
  (6, 'PURCHASE'::"StockMovementType", 6, 20, 0, 20, 'Compra inicial #2', NOW() - INTERVAL '19 days', NULL, 2),
  (7, 'PURCHASE'::"StockMovementType", 7, 20, 0, 20, 'Compra inicial #2', NOW() - INTERVAL '19 days', NULL, 2),
  (8, 'PURCHASE'::"StockMovementType", 8, 12, 0, 12, 'Compra inicial #2', NOW() - INTERVAL '19 days', NULL, 2),
  (9, 'PURCHASE'::"StockMovementType", 9, 10, 0, 10, 'Compra inicial #2', NOW() - INTERVAL '19 days', NULL, 2),
  (10, 'PURCHASE'::"StockMovementType", 10, 20, 0, 20, 'Compra inicial #2', NOW() - INTERVAL '19 days', NULL, 2),
  (11, 'PURCHASE'::"StockMovementType", 11, 30, 0, 30, 'Compra inicial #3', NOW() - INTERVAL '18 days', NULL, 3),
  (12, 'PURCHASE'::"StockMovementType", 12, 20, 0, 20, 'Compra inicial #3', NOW() - INTERVAL '18 days', NULL, 3),
  (13, 'PURCHASE'::"StockMovementType", 13, 25, 0, 25, 'Compra inicial #3', NOW() - INTERVAL '18 days', NULL, 3),
  (14, 'PURCHASE'::"StockMovementType", 14, 20, 0, 20, 'Compra inicial #3', NOW() - INTERVAL '18 days', NULL, 3),
  (15, 'PURCHASE'::"StockMovementType", 15, 18, 0, 18, 'Compra inicial #3', NOW() - INTERVAL '18 days', NULL, 3),
  (16, 'PURCHASE'::"StockMovementType", 16, 12, 0, 12, 'Compra inicial #4', NOW() - INTERVAL '17 days', NULL, 4),
  (17, 'PURCHASE'::"StockMovementType", 17, 15, 0, 15, 'Compra inicial #4', NOW() - INTERVAL '17 days', NULL, 4),
  (18, 'PURCHASE'::"StockMovementType", 18, 10, 0, 10, 'Compra inicial #4', NOW() - INTERVAL '17 days', NULL, 4),
  (19, 'PURCHASE'::"StockMovementType", 19, 15, 0, 15, 'Compra inicial #4', NOW() - INTERVAL '17 days', NULL, 4),
  (20, 'PURCHASE'::"StockMovementType", 20, 20, 0, 20, 'Compra inicial #4', NOW() - INTERVAL '17 days', NULL, 4),

  (21, 'SALE'::"StockMovementType", 1, 2, 24, 22, 'Venta #1', NOW() - INTERVAL '10 days', 1, NULL),
  (22, 'SALE'::"StockMovementType", 11, 2, 30, 28, 'Venta #1', NOW() - INTERVAL '10 days', 1, NULL),
  (23, 'SALE'::"StockMovementType", 15, 1, 18, 17, 'Venta #1', NOW() - INTERVAL '10 days', 1, NULL),
  (24, 'SALE'::"StockMovementType", 2, 1, 24, 23, 'Venta #2', NOW() - INTERVAL '9 days', 2, NULL),
  (25, 'SALE'::"StockMovementType", 6, 1, 20, 19, 'Venta #2', NOW() - INTERVAL '9 days', 2, NULL),
  (26, 'SALE'::"StockMovementType", 12, 1, 20, 19, 'Venta #2', NOW() - INTERVAL '9 days', 2, NULL),
  (27, 'SALE'::"StockMovementType", 3, 2, 30, 28, 'Venta #3', NOW() - INTERVAL '8 days', 3, NULL),
  (28, 'SALE'::"StockMovementType", 7, 1, 20, 19, 'Venta #3', NOW() - INTERVAL '8 days', 3, NULL),
  (29, 'SALE'::"StockMovementType", 14, 2, 20, 18, 'Venta #3', NOW() - INTERVAL '8 days', 3, NULL),
  (30, 'SALE'::"StockMovementType", 8, 1, 12, 11, 'Venta #4', NOW() - INTERVAL '7 days', 4, NULL),
  (31, 'SALE'::"StockMovementType", 9, 1, 10, 9, 'Venta #4', NOW() - INTERVAL '7 days', 4, NULL),
  (32, 'SALE'::"StockMovementType", 10, 1, 20, 19, 'Venta #4', NOW() - INTERVAL '7 days', 4, NULL),
  (33, 'SALE'::"StockMovementType", 16, 1, 12, 11, 'Venta #5', NOW() - INTERVAL '6 days', 5, NULL),
  (34, 'SALE'::"StockMovementType", 17, 1, 15, 14, 'Venta #5', NOW() - INTERVAL '6 days', 5, NULL),
  (35, 'SALE'::"StockMovementType", 18, 1, 10, 9, 'Venta #5', NOW() - INTERVAL '6 days', 5, NULL),
  (36, 'SALE'::"StockMovementType", 20, 2, 20, 18, 'Venta #5', NOW() - INTERVAL '6 days', 5, NULL);

-- ============================================================================
-- APORTE DE CAPITAL Y CIERRE REGULAR
-- El aporte solicitado es de $1.000.000 y usa movement_type_b = 'C'.
-- ============================================================================

INSERT INTO public."balance_b" (
  "id_balance_b",
  "date_b",
  "cash_in_b",
  "cash_out_b",
  "expected_closing_b",
  "actual_closing_b",
  "difference_b",
  "created_at",
  "opening_b",
  "movement_type_b",
  "updated_at",
  "id_employee_e"
) VALUES
  (1, NOW() - INTERVAL '30 days', 1000000.00, 0.00, 1000000.00, 1000000.00, 0.00, NOW() - INTERVAL '30 days', 0.00, 'C', NOW(), 1),
  (2, NOW() - INTERVAL '5 days', 16900.00, 403650.00, 613250.00, 613250.00, 0.00, NOW() - INTERVAL '5 days', 1000000.00, 'R', NOW(), 2);

-- ============================================================================
-- AJUSTE DE SECUENCIAS
-- pg_get_serial_sequence conserva compatibilidad aunque una migración haya
-- renombrado la columna asociada a la secuencia.
-- ============================================================================

SELECT setval(pg_get_serial_sequence('public.users_u', 'id_user_u'), (SELECT MAX("id_user_u") FROM public."users_u"), TRUE);
SELECT setval(pg_get_serial_sequence('public.employees_e', 'id_employee_e'), (SELECT MAX("id_employee_e") FROM public."employees_e"), TRUE);
SELECT setval(pg_get_serial_sequence('public.categories_c', 'id_category_c'), (SELECT MAX("id_category_c") FROM public."categories_c"), TRUE);
SELECT setval(pg_get_serial_sequence('public.suppliers_s', 'id_supplier_s'), (SELECT MAX("id_supplier_s") FROM public."suppliers_s"), TRUE);
SELECT setval(pg_get_serial_sequence('public.products_p', 'id_product_p'), (SELECT MAX("id_product_p") FROM public."products_p"), TRUE);
SELECT setval(pg_get_serial_sequence('public.transactions_t', 'id_transaction_t'), (SELECT MAX("id_transaction_t") FROM public."transactions_t"), TRUE);
SELECT setval(pg_get_serial_sequence('public.purchase_orders_po', 'id_purchase_order_po'), (SELECT MAX("id_purchase_order_po") FROM public."purchase_orders_po"), TRUE);
SELECT setval(pg_get_serial_sequence('public.sales_orders_so', 'id_sales_order_so'), (SELECT MAX("id_sales_order_so") FROM public."sales_orders_so"), TRUE);
SELECT setval(pg_get_serial_sequence('public.stock_movements_sm', 'id_stockmovement_sm'), (SELECT MAX("id_stockmovement_sm") FROM public."stock_movements_sm"), TRUE);
SELECT setval(pg_get_serial_sequence('public.balance_b', 'id_balance_b'), (SELECT MAX("id_balance_b") FROM public."balance_b"), TRUE);

-- Validaciones del contenido principal antes de confirmar la transacción.
DO $$
DECLARE
  suppliers_count INTEGER;
  products_count INTEGER;
  incorrectly_stocked_suppliers INTEGER;
BEGIN
  SELECT COUNT(*) INTO suppliers_count FROM public."suppliers_s";
  SELECT COUNT(*) INTO products_count FROM public."products_p";

  SELECT COUNT(*) INTO incorrectly_stocked_suppliers
  FROM (
    SELECT "supplierId"
    FROM public."products_on_suppliers_pos"
    GROUP BY "supplierId"
    HAVING COUNT(*) <> 5
  ) invalid_suppliers;

  IF suppliers_count <> 4 OR products_count <> 20 OR incorrectly_stocked_suppliers <> 0 THEN
    RAISE EXCEPTION 'Validación del seed fallida: proveedores=%, productos=%, proveedores con catálogo inválido=%',
      suppliers_count, products_count, incorrectly_stocked_suppliers;
  END IF;
END $$;

COMMIT;

-- Resumen esperado:
--   2 usuarios y 2 empleados
--   4 proveedores, cada uno con 5 productos y precios de costo
--   20 productos
--   4 compras y 5 ventas
--   1 aporte de capital por $1.000.000
--   1 cierre regular posterior a las operaciones
