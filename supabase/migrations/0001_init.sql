-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  stock int NOT NULL DEFAULT 0,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Create cart_items table
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL,
  shipping_name text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_postal_code text NOT NULL,
  shipping_phone text NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity int NOT NULL,
  price numeric NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for products (publicly readable)
CREATE POLICY "Products are publicly readable" 
ON products FOR SELECT 
TO public 
USING (true);

-- Policies for cart_items (restrict to matching user_id)
CREATE POLICY "Users can manage their own cart" 
ON cart_items FOR ALL 
USING (user_id = auth.uid()::text);

-- Policies for orders (restrict to matching user_id)
CREATE POLICY "Users can manage their own orders" 
ON orders FOR ALL 
USING (user_id = auth.uid()::text);

-- Seed products with 8 realistic sample rows
INSERT INTO products (name, description, price, image_url, category, stock, slug) VALUES
(
  'Wireless Noise-Cancelling Headphones',
  'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality sound.',
  149.99,
  'https://picsum.photos/seed/headphones/600/600',
  'Audio',
  50,
  'wireless-noise-cancelling-headphones'
),
(
  'Mechanical Keyboard — TKL',
  'Tenkeyless mechanical keyboard with hot-swappable switches, RGB backlighting, and an aircraft-grade aluminium frame.',
  119.99,
  'https://picsum.photos/seed/keyboard/600/600',
  'Peripherals',
  35,
  'mechanical-keyboard-tkl'
),
(
  '4K Ultra-Wide Monitor 34"',
  'Curved 34-inch IPS display with 144 Hz refresh rate, HDR400, and USB-C 65 W charging built in.',
  499.99,
  'https://picsum.photos/seed/monitor/600/600',
  'Displays',
  15,
  '4k-ultrawide-monitor-34'
),
(
  'Ergonomic Mesh Office Chair',
  'Fully adjustable lumbar support, breathable mesh back, and 5-year warranty. Ideal for long work sessions.',
  329.00,
  'https://picsum.photos/seed/chair/600/600',
  'Furniture',
  20,
  'ergonomic-mesh-office-chair'
),
(
  'Portable SSD — 1 TB',
  'USB 3.2 Gen 2 external SSD with read speeds up to 1 050 MB/s. Drop-resistant and pocket-sized.',
  89.99,
  'https://picsum.photos/seed/ssd/600/600',
  'Storage',
  100,
  'portable-ssd-1tb'
),
(
  'Smart LED Desk Lamp',
  'Touch-controlled lamp with 5 colour temperatures, wireless charging base, and USB-A output port.',
  54.99,
  'https://picsum.photos/seed/lamp/600/600',
  'Accessories',
  75,
  'smart-led-desk-lamp'
),
(
  'Wireless Charging Pad',
  'Qi-certified 15 W fast-charging pad compatible with iPhone, Android, and AirPods. Slim, mat-finish design.',
  34.99,
  'https://picsum.photos/seed/charger/600/600',
  'Accessories',
  120,
  'wireless-charging-pad'
),
(
  'USB-C Hub — 9-in-1',
  'Expands your laptop with 4K HDMI, 100 W PD, SD/microSD slots, 3× USB-A 3.0, and Gigabit Ethernet.',
  69.99,
  'https://picsum.photos/seed/hub/600/600',
  'Peripherals',
  200,
  'usb-c-hub-9-in-1'
);
