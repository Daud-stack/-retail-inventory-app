-- =============================================================================
-- SEED DATA FOR NEXUS RETAIL INVENTORY MANAGEMENT
-- Populates Products, Inventory, Pricing, Invoices, and Stock Audit Log
-- =============================================================================

DO $$
DECLARE
    -- Product UUID variables
    p_jacket UUID := gen_random_uuid();
    p_tee UUID := gen_random_uuid();
    p_chino UUID := gen_random_uuid();
    p_hoodie UUID := gen_random_uuid();
    
    p_coffee UUID := gen_random_uuid();
    p_oil UUID := gen_random_uuid();
    p_milk UUID := gen_random_uuid();
    p_bread UUID := gen_random_uuid();
    p_honey UUID := gen_random_uuid();

    p_mouse UUID := gen_random_uuid();
    p_bottle UUID := gen_random_uuid();
    p_diffuser UUID := gen_random_uuid();
    p_cable UUID := gen_random_uuid();

    -- Invoice UUID variables
    inv_1094 UUID := gen_random_uuid();
    inv_1093 UUID := gen_random_uuid();
BEGIN
    -- 1. INSERT PRODUCTS
    INSERT INTO products (id, barcode_sku, name, category, description, supplier) VALUES
    (p_jacket, 'CLN-849201', 'Vintage Denim Jacket', 'Clothing', 'Classic washed indigo denim jacket with brass buttons.', 'UrbanWear Apparel'),
    (p_tee, 'CLN-392019', 'Organic Cotton Crew Tee', 'Clothing', 'Soft breathable 100% organic cotton daily crew shirt.', 'EcoThread Co.'),
    (p_chino, 'CLN-583012', 'Slim Fit Chino Pants', 'Clothing', 'Stretch twill chinos ideal for casual or smart outfits.', 'UrbanWear Apparel'),
    (p_hoodie, 'CLN-104928', 'Thermal Fleece Hoodie', 'Clothing', 'Heavyweight fleece hoodie for cold weather comfort.', 'NorthPeak Gear'),

    (p_coffee, 'GRO-194820', 'Artisanal Cold Brew Coffee (1L)', 'Groceries', '12-hour steep cold brew concentrate bottle.', 'Roast & Brew Beans'),
    (p_oil, 'GRO-884920', 'Extra Virgin Olive Oil (750ml)', 'Groceries', 'First cold-pressed Mediterranean olive oil.', 'Mediterranean Imports'),
    (p_milk, 'GRO-503912', 'Organic Almond Milk (1L)', 'Groceries', 'Unsweetened plant-based organic almond drink.', 'NutriPure Foods'),
    (p_bread, 'GRO-772910', 'Sourdough Craft Loaf', 'Groceries', 'Freshly baked artisanal sourdough bread.', 'Golden Crust Bakery'),
    (p_honey, 'GRO-930219', 'Raw Wildflower Honey (500g)', 'Groceries', 'Pure unfiltered raw wildflower honey jar.', 'Valley Apiaries'),

    (p_mouse, 'MSC-774910', 'Wireless Ergonomic Mouse', 'Miscellaneous', 'Silent-click 2.4GHz wireless mouse with thumb rest.', 'TechGrid Electronics'),
    (p_bottle, 'MSC-449102', 'Stainless Steel Water Bottle (750ml)', 'Miscellaneous', 'Double-wall vacuum insulated flask.', 'HydroPeak Essentials'),
    (p_diffuser, 'MSC-662019', 'Aroma Diffuser & Essential Oils', 'Miscellaneous', 'Ultrasonic mist humidifier with RGB LED lighting.', 'ZenLiving Co.'),
    (p_cable, 'MSC-302910', 'Braided USB-C Fast Charge Cable (2m)', 'Miscellaneous', 'Durable nylon braided 100W PD charging cord.', 'TechGrid Electronics');

    -- 2. INSERT INVENTORY
    INSERT INTO inventory (product_id, current_stock, reorder_level, expiry_date, size_color_variant, unit, location) VALUES
    (p_jacket, 18, 5, NULL, 'Size L / Washed Blue', 'pcs', 'Aisle C - Rack 04'),
    (p_tee, 4, 10, NULL, 'Size M / Off-White', 'pcs', 'Aisle C - Rack 01'),
    (p_chino, 32, 8, NULL, 'Size 32/34 / Beige', 'pcs', 'Aisle C - Rack 08'),
    (p_hoodie, 2, 6, NULL, 'Size XL / Slate Grey', 'pcs', 'Aisle C - Rack 12'),

    (p_coffee, 45, 15, CURRENT_DATE + INTERVAL '45 days', NULL, 'bottle', 'Fridge 02 - Shelf A'),
    (p_oil, 3, 8, CURRENT_DATE + INTERVAL '180 days', NULL, 'bottle', 'Aisle G - Shelf 03'),
    (p_milk, 60, 20, CURRENT_DATE + INTERVAL '20 days', NULL, 'carton', 'Fridge 01 - Shelf B'),
    (p_bread, 0, 10, CURRENT_DATE + INTERVAL '3 days', NULL, 'loaf', 'Aisle G - Bakery Table'),
    (p_honey, 24, 5, CURRENT_DATE + INTERVAL '365 days', NULL, 'jar', 'Aisle G - Shelf 05'),

    (p_mouse, 28, 8, NULL, 'Matte Black', 'box', 'Aisle M - Bin 14'),
    (p_bottle, 5, 12, NULL, 'Navy Blue', 'pcs', 'Aisle M - Shelf 02'),
    (p_diffuser, 14, 5, NULL, 'Light Wood Grain', 'set', 'Aisle M - Shelf 09'),
    (p_cable, 85, 25, NULL, 'Dark Grey 2 Meter', 'pcs', 'Aisle M - Counter Display');

    -- 3. INSERT PRICING
    INSERT INTO pricing (product_id, cost_price, selling_price) VALUES
    (p_jacket, 45.00, 89.99),
    (p_tee, 9.80, 24.50),
    (p_chino, 26.00, 54.00),
    (p_hoodie, 31.50, 68.00),

    (p_coffee, 4.20, 9.99),
    (p_oil, 11.00, 18.50),
    (p_milk, 2.10, 4.75),
    (p_bread, 2.50, 6.20),
    (p_honey, 6.50, 12.99),

    (p_mouse, 18.00, 39.99),
    (p_bottle, 8.50, 22.00),
    (p_diffuser, 21.00, 49.50),
    (p_cable, 4.20, 14.99);

    -- 4. INSERT SAMPLE POS INVOICE HISTORY
    INSERT INTO invoices (id, invoice_number, customer_name, payment_method, subtotal, tax_rate, tax_amount, discount_amount, total_amount) VALUES
    (inv_1094, 'INV-1094', 'Walk-in Customer', 'Credit Card', 115.26, 8.00, 9.22, 0.00, 124.48),
    (inv_1093, 'INV-1093', 'Sarah Jenkins', 'Mobile / NFC', 83.32, 8.00, 6.67, 0.00, 89.99);

    INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES
    (inv_1094, p_mouse, 1, 39.99),
    (inv_1094, p_coffee, 2, 9.99),
    (inv_1094, p_cable, 3, 14.99),
    
    (inv_1093, p_jacket, 1, 89.99);

    -- 5. INSERT AUDIT LOG STOCK MOVEMENTS
    INSERT INTO stock_movements (product_id, movement_type, quantity_change, previous_stock, new_stock, reference_id, notes) VALUES
    (p_jacket, 'Restock', +20, 0, 20, 'PO-8821', 'Initial warehouse stock intake'),
    (p_jacket, 'Sale', -2, 20, 18, 'INV-1093', 'POS counter sale checkout'),
    (p_bread, 'Spoilage', -10, 10, 0, 'SPOIL-042', 'Expired bake batch write-off');

END $$;
