-- ─── Products Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Cart Items Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL, -- Firebase UID
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Orders Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL, -- Firebase UID
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL,
  shipping_details jsonb NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if table already existed without them
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

-- ─── Order Items Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL, -- Captured at time of purchase
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Insert Dummy Data ────────────────────────────────────────────────────────
INSERT INTO public.products (name, description, price, image_url, category, slug)
VALUES
  ('Minimalist Leather Watch', 'A sleek, minimalist watch with a genuine leather strap.', 129.99, 'https://picsum.photos/seed/watch/600', 'Accessories', 'minimalist-leather-watch'),
  ('Noise-Cancelling Headphones', 'Over-ear headphones with active noise cancellation and 30-hour battery life.', 249.50, 'https://picsum.photos/seed/headphones/600', 'Audio', 'noise-cancelling-headphones'),
  ('Mechanical Keyboard', 'Tenkeyless mechanical keyboard with tactile switches.', 145.00, 'https://picsum.photos/seed/keyboard/600', 'Tech', 'mechanical-keyboard'),
  ('Wireless Charging Pad', 'Fast wireless charging pad for all Qi-enabled devices.', 35.00, 'https://picsum.photos/seed/charger/600', 'Tech', 'wireless-charging-pad'),
  ('Canvas Messenger Bag', 'Durable canvas bag perfect for laptops and daily commute.', 85.00, 'https://picsum.photos/seed/bag/600', 'Accessories', 'canvas-messenger-bag'),
  ('Smart Home Hub', 'Control your entire smart home from one simple device.', 110.00, 'https://picsum.photos/seed/hub/600', 'Tech', 'smart-home-hub'),
  ('Bluetooth Speaker', 'Waterproof portable bluetooth speaker with deep bass.', 75.99, 'https://picsum.photos/seed/speaker/600', 'Audio', 'bluetooth-speaker'),
  ('Aluminium Laptop Stand', 'Ergonomic laptop stand made from premium aluminium.', 45.00, 'https://picsum.photos/seed/stand/600', 'Accessories', 'aluminium-laptop-stand')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for products (publicly readable)
CREATE POLICY "Products are publicly readable" 
ON public.products FOR SELECT 
TO public 
USING (true);

-- Policies for cart_items (restrict to matching user_id)
CREATE POLICY "Users can manage their own cart" 
ON public.cart_items FOR ALL 
USING (user_id = auth.uid()::text);

-- Policies for orders (restrict to matching user_id)
CREATE POLICY "Users can manage their own orders" 
ON public.orders FOR ALL 
USING (user_id = auth.uid()::text);

