-- =====================================================
-- HEALTHPRO v2 — Supabase SQL Schema
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: banners (URL-based, no file upload)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL CHECK (section IN ('hero', 'mid', 'masalah', 'solusi', 'manfaat', 'testimoni', 'promo')),
  image_url TEXT NOT NULL,
  link_url TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: products (multi-page, flash sale, gallery)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC(12, 0) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12, 0),
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_flash_sale BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 0,
  sold_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: orders
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'baru' CHECK (status IN ('baru', 'diproses', 'selesai', 'dibatalkan')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: settings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_banners_section_active ON public.banners(section, is_active);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON public.banners(section, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_flash ON public.products(is_flash_sale, is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- =====================================================
-- AUTO-UPDATE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Banners
CREATE POLICY "Public read active banners" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access banners" ON public.banners FOR ALL USING (auth.role() = 'authenticated');

-- Products
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- Orders
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Settings
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- DEFAULT DATA
-- =====================================================
INSERT INTO public.settings (key, value) VALUES
  ('site_name', 'HealthPro'),
  ('whatsapp_number', '6281234567890'),
  ('bank_name', 'BCA'),
  ('account_number', '1234567890'),
  ('account_holder', 'Admin HealthPro')
ON CONFLICT (key) DO NOTHING;

-- Sample products
INSERT INTO public.products (name, slug, price, original_price, description, is_active, is_featured, is_flash_sale, sold_count) VALUES
  ('Suplemen Imunitas Premium', 'suplemen-imunitas-premium', 149000, 199000, 'Suplemen kesehatan premium untuk meningkatkan imunitas tubuh', true, true, true, 342),
  ('Vitamin C 1000mg', 'vitamin-c-1000mg', 89000, 120000, 'Vitamin C dosis tinggi untuk tubuh lebih sehat dan bugar', true, true, false, 215),
  ('Herbal Detox Plus', 'herbal-detox-plus', 119000, 150000, 'Formula herbal alami untuk detoksifikasi tubuh', true, false, true, 178),
  ('Minyak Ikan Omega 3', 'minyak-ikan-omega-3', 99000, null, 'Suplemen omega 3 untuk kesehatan jantung dan otak', true, false, false, 95)
ON CONFLICT (slug) DO NOTHING;
