-- ============================================
-- PRECISION POP - SAFE MIGRATION
-- Only touches NEW tables, preserves existing data
-- ============================================

-- 1. SAFELY drop only NEW tables (no existing data)
DROP TABLE IF EXISTS ingredient_placements CASCADE;
DROP TABLE IF EXISTS recipe_imports CASCADE;
DROP TABLE IF EXISTS ingredient_bids CASCADE;
DROP TABLE IF EXISTS ingredient_categories CASCADE;
DROP TABLE IF EXISTS coupon_bids CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- Note: This does NOT touch your existing tables:
-- ✅ check_ins - SAFE
-- ✅ flash_promos - SAFE
-- ✅ offer_redemptions - SAFE
-- ✅ campaigns - SAFE
-- ✅ brands - SAFE (if exists)

-- ============================================
-- CREATE NEW TABLES
-- ============================================

-- 1. Coupons (what grocers create, brands bid on)
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  expiration DATE,
  min_purchase NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  bidding_enabled BOOLEAN DEFAULT false,
  impressions INTEGER DEFAULT 0,
  redemptions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Coupon bids (brands bidding for coupon placement)
CREATE TABLE public.coupon_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  brand_id TEXT NOT NULL,
  bid_amount NUMERIC(10,4) NOT NULL,
  bid_type TEXT DEFAULT 'cpi',
  status TEXT DEFAULT 'active',
  daily_budget NUMERIC(10,2),
  impressions_delivered INTEGER DEFAULT 0,
  clicks_delivered INTEGER DEFAULT 0,
  conversions_delivered INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ingredient categories (pasta, milk, eggs, etc.)
CREATE TABLE public.ingredient_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  parent_category TEXT,
  search_terms TEXT[],
  avg_weekly_imports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ingredient bids (brands bidding for recipe placement)
CREATE TABLE public.ingredient_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id TEXT NOT NULL,
  ingredient_category_id UUID REFERENCES public.ingredient_categories(id) ON DELETE CASCADE,
  ingredient_keyword TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_price NUMERIC(10,2),
  bid_amount NUMERIC(10,4) NOT NULL,
  bid_type TEXT DEFAULT 'cpi',
  status TEXT DEFAULT 'active',
  daily_budget NUMERIC(10,2),
  placements_delivered INTEGER DEFAULT 0,
  accepted INTEGER DEFAULT 0,
  swapped INTEGER DEFAULT 0,
  purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Recipe imports (customer-imported recipes)
CREATE TABLE public.recipe_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  retailer_id TEXT NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_source TEXT,
  recipe_url TEXT,
  servings INTEGER DEFAULT 4,
  ingredients_parsed JSONB,
  total_ingredients INTEGER,
  sponsored_ingredients INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Ingredient placements (tracks which brand won each slot)
CREATE TABLE public.ingredient_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_import_id UUID REFERENCES public.recipe_imports(id) ON DELETE CASCADE,
  ingredient_category_id UUID REFERENCES public.ingredient_categories(id),
  ingredient_raw TEXT,
  ingredient_normalized TEXT,
  winning_bid_id UUID REFERENCES public.ingredient_bids(id),
  winning_brand TEXT,
  winning_product_name TEXT,
  winning_product_price NUMERIC(10,2),
  bid_amount_paid NUMERIC(10,4),
  user_action TEXT DEFAULT 'pending',
  alternative_chosen TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_coupons_retailer ON public.coupons(retailer_id);
CREATE INDEX idx_coupons_status ON public.coupons(status);
CREATE INDEX idx_coupons_bidding ON public.coupons(bidding_enabled);

CREATE INDEX idx_coupon_bids_coupon ON public.coupon_bids(coupon_id);
CREATE INDEX idx_coupon_bids_brand ON public.coupon_bids(brand_id);
CREATE INDEX idx_coupon_bids_status ON public.coupon_bids(status);

CREATE INDEX idx_ingredient_categories_name ON public.ingredient_categories(name);

CREATE INDEX idx_ingredient_bids_category ON public.ingredient_bids(ingredient_category_id);
CREATE INDEX idx_ingredient_bids_brand ON public.ingredient_bids(brand_id);
CREATE INDEX idx_ingredient_bids_status ON public.ingredient_bids(status);

CREATE INDEX idx_recipe_imports_user ON public.recipe_imports(user_id);
CREATE INDEX idx_recipe_imports_retailer ON public.recipe_imports(retailer_id);

CREATE INDEX idx_ingredient_placements_recipe ON public.ingredient_placements(recipe_import_id);
CREATE INDEX idx_ingredient_placements_bid ON public.ingredient_placements(winning_bid_id);

-- ============================================
-- SEED TEST DATA
-- ============================================

-- Seed 5 test coupons
INSERT INTO public.coupons (retailer_id, title, description, brand, value, category, image_url, expiration, bidding_enabled, impressions)
VALUES 
  ('heb', 'Save $2 on Milk', 'Any variety, half gallon or larger', 'Generic', 2.00, 'dairy', 'https://images.heb.com/is/image/HEBGrocery/000120185', '2025-12-31', true, 420),
  ('heb', 'Save $1.50 on Eggs', 'Large eggs, 1 dozen', 'Generic', 1.50, 'dairy', 'https://images.heb.com/is/image/HEBGrocery/001508562', '2025-12-31', true, 380),
  ('heb', 'Save $3 on Pasta', 'Any variety, 12-16oz', 'Generic', 3.00, 'pantry', 'https://images.heb.com/is/image/HEBGrocery/000114101', '2025-12-31', true, 650),
  ('heb', 'Save $1 on Bread', 'Any sandwich bread', 'Generic', 1.00, 'bakery', 'https://images.heb.com/is/image/HEBGrocery/000325901', '2025-12-31', true, 290),
  ('heb', 'Save $2 on Cheese', 'Block cheese, 8oz or larger', 'Generic', 2.00, 'dairy', 'https://images.heb.com/is/image/HEBGrocery/000115102', '2025-12-31', true, 340);

-- Seed ingredient categories
INSERT INTO public.ingredient_categories (name, parent_category, search_terms, avg_weekly_imports)
VALUES
  ('pasta', 'pantry', ARRAY['spaghetti', 'penne', 'linguine', 'fettuccine', 'macaroni', 'noodles'], 850),
  ('milk', 'dairy', ARRAY['whole milk', 'skim milk', '2% milk', 'dairy milk'], 1200),
  ('eggs', 'dairy', ARRAY['large eggs', 'egg', 'chicken eggs'], 950),
  ('cheese', 'dairy', ARRAY['parmesan', 'cheddar', 'mozzarella', 'swiss', 'feta'], 720),
  ('butter', 'dairy', ARRAY['salted butter', 'unsalted butter'], 650),
  ('bread', 'bakery', ARRAY['sandwich bread', 'white bread', 'wheat bread'], 580),
  ('chicken', 'meat', ARRAY['chicken breast', 'chicken thighs', 'whole chicken'], 890),
  ('beef', 'meat', ARRAY['ground beef', 'steak', 'beef chuck', 'hamburger'], 670),
  ('rice', 'pantry', ARRAY['white rice', 'brown rice', 'jasmine rice'], 520),
  ('flour', 'pantry', ARRAY['all-purpose flour', 'wheat flour', 'bread flour'], 420),
  ('tomatoes', 'produce', ARRAY['fresh tomatoes', 'roma tomatoes', 'cherry tomatoes'], 780),
  ('onions', 'produce', ARRAY['yellow onions', 'white onions', 'red onions'], 690),
  ('garlic', 'produce', ARRAY['fresh garlic', 'garlic cloves'], 540),
  ('potatoes', 'produce', ARRAY['russet potatoes', 'red potatoes', 'yukon gold'], 610),
  ('oil', 'pantry', ARRAY['vegetable oil', 'olive oil', 'canola oil', 'cooking oil'], 480);

-- Add competing bids
INSERT INTO public.coupon_bids (coupon_id, brand_id, bid_amount, impressions_delivered, conversions_delivered, status)
SELECT 
  id,
  'dev-brand-002', 
  0.05,
  FLOOR(impressions * 0.3)::INTEGER,
  FLOOR(impressions * 0.05)::INTEGER,
  'active'
FROM public.coupons
WHERE title LIKE '%Milk%';

INSERT INTO public.coupon_bids (coupon_id, brand_id, bid_amount, impressions_delivered, conversions_delivered, status)
SELECT 
  id,
  'dev-brand-003', 
  0.08,
  FLOOR(impressions * 0.2)::INTEGER,
  FLOOR(impressions * 0.04)::INTEGER,
  'active'
FROM public.coupons
WHERE title LIKE '%Pasta%';

-- Add ingredient bids
INSERT INTO public.ingredient_bids (
  brand_id, 
  ingredient_category_id, 
  product_name, 
  product_image,
  product_price, 
  bid_amount, 
  placements_delivered, 
  accepted,
  purchased,
  status
)
SELECT 
  'dev-brand-002',
  id,
  CASE name
    WHEN 'pasta' THEN 'Barilla Spaghetti 16oz'
    WHEN 'milk' THEN 'Horizon Organic Milk'
    WHEN 'eggs' THEN 'Vital Farms Pasture-Raised Eggs'
    WHEN 'cheese' THEN 'Athenos Feta Cheese'
    ELSE CONCAT('Premium ', INITCAP(name))
  END,
  CASE name
    WHEN 'pasta' THEN 'https://images.heb.com/is/image/HEBGrocery/000114101'
    WHEN 'milk' THEN 'https://images.heb.com/is/image/HEBGrocery/000120185'
    WHEN 'eggs' THEN 'https://images.heb.com/is/image/HEBGrocery/001508562'
    ELSE NULL
  END,
  CASE name
    WHEN 'pasta' THEN 3.99
    WHEN 'milk' THEN 5.49
    WHEN 'eggs' THEN 6.99
    WHEN 'cheese' THEN 4.99
    ELSE 4.99
  END,
  0.10,
  FLOOR(avg_weekly_imports * 0.4)::INTEGER,
  FLOOR(avg_weekly_imports * 0.3)::INTEGER,
  FLOOR(avg_weekly_imports * 0.25)::INTEGER,
  'active'
FROM public.ingredient_categories
WHERE name IN ('pasta', 'milk', 'eggs', 'cheese');

INSERT INTO public.ingredient_bids (
  brand_id, 
  ingredient_category_id, 
  product_name, 
  product_price, 
  bid_amount, 
  placements_delivered, 
  accepted,
  status
)
SELECT 
  'dev-brand-003',
  id,
  CASE name
    WHEN 'pasta' THEN 'Rao''s Pasta 16oz'
    WHEN 'milk' THEN 'Organic Valley Milk'
    ELSE CONCAT('Store Brand ', INITCAP(name))
  END,
  CASE name
    WHEN 'pasta' THEN 4.49
    WHEN 'milk' THEN 4.99
    ELSE 3.99
  END,
  0.08,
  FLOOR(avg_weekly_imports * 0.1)::INTEGER,
  FLOOR(avg_weekly_imports * 0.08)::INTEGER,
  'active'
FROM public.ingredient_categories
WHERE name IN ('pasta', 'milk');