-- Create additional enum types
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE public.bid_type AS ENUM ('cpm', 'cpc');
CREATE TYPE public.offer_type AS ENUM ('campaign', 'flash', 'standard');

-- Create brands table (who pays for campaigns)
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  subscription_tier subscription_tier DEFAULT 'free',
  total_spend NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create campaigns table (CPG brand campaigns)
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  budget_total NUMERIC NOT NULL,
  budget_spent NUMERIC DEFAULT 0,
  bid_amount NUMERIC NOT NULL,
  bid_type bid_type DEFAULT 'cpm',
  target_segments TEXT[],
  creative_url TEXT,
  discount_value NUMERIC,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status campaign_status DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stores table (retailer locations)
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  beacon_ids TEXT[],
  geofence_coordinates JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create customers table (loyalty profiles)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  loyalty_card_number TEXT,
  phone_number TEXT,
  purchase_history JSONB DEFAULT '{}',
  segments TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_id, loyalty_card_number)
);

-- Create customer_segments table (AI-generated segments)
CREATE TABLE public.customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  definition JSONB NOT NULL,
  customer_count INTEGER DEFAULT 0,
  avg_basket_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create offers table (unified presentation layer)
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  flash_promo_id UUID REFERENCES public.flash_promos(id) ON DELETE CASCADE,
  type offer_type NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  discount_value NUMERIC NOT NULL,
  image_url TEXT,
  video_url TEXT,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (campaign_id IS NOT NULL AND flash_promo_id IS NULL) OR
    (campaign_id IS NULL AND flash_promo_id IS NOT NULL) OR
    (campaign_id IS NULL AND flash_promo_id IS NULL AND type = 'standard')
  )
);

-- Create accepted_offers table (swipe right actions)
CREATE TABLE public.accepted_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create redemptions table (ROI tracking)
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accepted_offer_id UUID REFERENCES public.accepted_offers(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  basket_total NUMERIC,
  discount_applied NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_brands_user ON public.brands(user_id);
CREATE INDEX idx_campaigns_brand ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status_dates ON public.campaigns(status, start_date, end_date);
CREATE INDEX idx_stores_retailer ON public.stores(retailer_id);
CREATE INDEX idx_customers_retailer ON public.customers(retailer_id);
CREATE INDEX idx_customers_loyalty ON public.customers(retailer_id, loyalty_card_number);
CREATE INDEX idx_offers_campaign ON public.offers(campaign_id);
CREATE INDEX idx_offers_flash_promo ON public.offers(flash_promo_id);
CREATE INDEX idx_offers_valid ON public.offers(valid_until);
CREATE INDEX idx_accepted_offers_customer ON public.accepted_offers(customer_id);
CREATE INDEX idx_accepted_offers_offer ON public.accepted_offers(offer_id);
CREATE INDEX idx_accepted_offers_checkin ON public.accepted_offers(check_in_id);
CREATE INDEX idx_redemptions_accepted_offer ON public.redemptions(accepted_offer_id);
CREATE INDEX idx_redemptions_customer ON public.redemptions(customer_id);
CREATE INDEX idx_redemptions_retailer ON public.redemptions(retailer_id);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accepted_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brands
CREATE POLICY "Brands can view their own data"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can update their own data"
  ON public.brands FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for campaigns
CREATE POLICY "Brands can view their campaigns"
  ON public.campaigns FOR SELECT
  USING (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can update their campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can delete their campaigns"
  ON public.campaigns FOR DELETE
  USING (
    brand_id IN (
      SELECT id FROM public.brands WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for stores
CREATE POLICY "Retailers can view their stores"
  ON public.stores FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can insert stores"
  ON public.stores FOR INSERT
  WITH CHECK (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can update their stores"
  ON public.stores FOR UPDATE
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can delete their stores"
  ON public.stores FOR DELETE
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for customers
CREATE POLICY "Retailers can view their customers"
  ON public.customers FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can update their customers"
  ON public.customers FOR UPDATE
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for customer_segments
CREATE POLICY "Everyone can view segments"
  ON public.customer_segments FOR SELECT
  USING (true);

-- RLS Policies for offers
CREATE POLICY "Everyone can view active offers"
  ON public.offers FOR SELECT
  USING (valid_until > now());

CREATE POLICY "Brands can manage campaign offers"
  ON public.offers FOR ALL
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      JOIN public.brands b ON c.brand_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can manage flash offers"
  ON public.offers FOR ALL
  USING (
    flash_promo_id IN (
      SELECT id FROM public.flash_promos
      WHERE retailer_id IN (
        SELECT id FROM public.retailers WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for accepted_offers
CREATE POLICY "Retailers can view accepted offers"
  ON public.accepted_offers FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE retailer_id IN (
        SELECT id FROM public.retailers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert accepted offers"
  ON public.accepted_offers FOR INSERT
  WITH CHECK (true);

-- RLS Policies for redemptions
CREATE POLICY "Retailers can view their redemptions"
  ON public.redemptions FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can insert redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_brands
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_campaigns
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_stores
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_customer_segments
  BEFORE UPDATE ON public.customer_segments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_offers
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_accepted_offers
  BEFORE UPDATE ON public.accepted_offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_redemptions
  BEFORE UPDATE ON public.redemptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();