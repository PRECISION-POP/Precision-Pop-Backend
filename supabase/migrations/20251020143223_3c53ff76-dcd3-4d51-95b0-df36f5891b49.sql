-- Ingredient categories for recipe bidding
CREATE TABLE public.ingredient_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  avg_monthly_searches INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand bids on ingredient keywords
CREATE TABLE public.ingredient_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  ingredient_keyword TEXT NOT NULL,
  category_id UUID REFERENCES public.ingredient_categories(id) ON DELETE SET NULL,
  bid_amount NUMERIC(10,4) NOT NULL,
  bid_type TEXT DEFAULT 'cpi',
  status TEXT DEFAULT 'active',
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_price NUMERIC(10,2),
  impressions_delivered INTEGER DEFAULT 0,
  swaps_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer recipe imports
CREATE TABLE public.recipe_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  recipe_name TEXT,
  recipe_url TEXT,
  recipe_image TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track which product won placement for each ingredient
CREATE TABLE public.ingredient_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_import_id UUID NOT NULL REFERENCES public.recipe_imports(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  winning_bid_id UUID REFERENCES public.ingredient_bids(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_price NUMERIC(10,2),
  is_sponsored BOOLEAN DEFAULT false,
  impressions INTEGER DEFAULT 0,
  user_swapped BOOLEAN DEFAULT false,
  swapped_to_product TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ingredient_bids_brand ON public.ingredient_bids(brand_id);
CREATE INDEX idx_ingredient_bids_keyword ON public.ingredient_bids(ingredient_keyword);
CREATE INDEX idx_ingredient_bids_status ON public.ingredient_bids(status);
CREATE INDEX idx_recipe_imports_customer ON public.recipe_imports(customer_id);
CREATE INDEX idx_ingredient_placements_recipe ON public.ingredient_placements(recipe_import_id);

-- Enable RLS
ALTER TABLE public.ingredient_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ingredient_categories (public read)
CREATE POLICY "Everyone can view ingredient categories"
  ON public.ingredient_categories FOR SELECT
  USING (true);

-- RLS Policies for ingredient_bids
CREATE POLICY "Brands can view their bids"
  ON public.ingredient_bids FOR SELECT
  USING (brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can insert bids"
  ON public.ingredient_bids FOR INSERT
  WITH CHECK (brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can update their bids"
  ON public.ingredient_bids FOR UPDATE
  USING (brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can delete their bids"
  ON public.ingredient_bids FOR DELETE
  USING (brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  ));

-- RLS Policies for recipe_imports
CREATE POLICY "Retailers can view their recipe imports"
  ON public.recipe_imports FOR SELECT
  USING (retailer_id IN (
    SELECT id FROM public.retailers WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert recipe imports"
  ON public.recipe_imports FOR INSERT
  WITH CHECK (true);

-- RLS Policies for ingredient_placements
CREATE POLICY "Everyone can view placements"
  ON public.ingredient_placements FOR SELECT
  USING (true);

CREATE POLICY "System can insert placements"
  ON public.ingredient_placements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update placements"
  ON public.ingredient_placements FOR UPDATE
  USING (true);

-- Triggers
CREATE TRIGGER update_ingredient_bids_updated_at
  BEFORE UPDATE ON public.ingredient_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed ingredient categories
INSERT INTO public.ingredient_categories (name, description, avg_monthly_searches) VALUES
  ('Dairy', 'Milk, cheese, yogurt, butter', 15000),
  ('Produce', 'Fruits and vegetables', 22000),
  ('Meat & Seafood', 'Fresh and frozen proteins', 18000),
  ('Bakery', 'Bread, pastries, baked goods', 12000),
  ('Pantry', 'Canned goods, pasta, rice, oils', 20000),
  ('Beverages', 'Drinks, juices, coffee, tea', 14000),
  ('Frozen', 'Frozen meals and ingredients', 10000),
  ('Snacks', 'Chips, crackers, candy', 16000);