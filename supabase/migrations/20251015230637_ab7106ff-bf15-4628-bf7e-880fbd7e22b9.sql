-- Create enum types
CREATE TYPE public.check_in_method AS ENUM ('geofence', 'BLE', 'manual', 'NFC');
CREATE TYPE public.discount_type AS ENUM ('fixed', 'percentage');
CREATE TYPE public.promo_priority AS ENUM ('high', 'normal');
CREATE TYPE public.promo_status AS ENUM ('active', 'completed', 'autoDisabled');

-- Create retailers table
CREATE TABLE public.retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create check_ins table
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_in_method check_in_method DEFAULT 'geofence',
  campaigns_shown UUID[],
  billable_impressions JSONB DEFAULT '{}',
  session_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create flash_promos table
CREATE TABLE public.flash_promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  created_by TEXT NOT NULL,
  type TEXT DEFAULT 'retailerFlash',
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  stock_remaining INTEGER DEFAULT 0,
  stock_initial INTEGER DEFAULT 0,
  auto_disable_at_zero BOOLEAN DEFAULT true,
  discount_type discount_type NOT NULL,
  discount_value NUMERIC NOT NULL,
  regular_price NUMERIC DEFAULT 0,
  discounted_price NUMERIC DEFAULT 0,
  show_to_all BOOLEAN DEFAULT false,
  target_segments UUID[],
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ NOT NULL,
  priority promo_priority DEFAULT 'normal',
  metrics JSONB DEFAULT '{"impressions": 0, "accepts": 0, "redemptions": 0, "stockMoved": 0, "stockMovedPercentage": 0}',
  status promo_status DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create interactions table
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL,
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID,
  campaign_type TEXT,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_check_ins_customer ON public.check_ins(customer_id);
CREATE INDEX idx_check_ins_retailer ON public.check_ins(retailer_id);
CREATE INDEX idx_check_ins_retailer_time ON public.check_ins(retailer_id, check_in_time DESC);
CREATE INDEX idx_check_ins_customer_time ON public.check_ins(customer_id, check_in_time DESC);

CREATE INDEX idx_flash_promos_retailer ON public.flash_promos(retailer_id);
CREATE INDEX idx_flash_promos_retailer_status ON public.flash_promos(retailer_id, status, start_time DESC);
CREATE INDEX idx_flash_promos_retailer_end ON public.flash_promos(retailer_id, end_time);

CREATE INDEX idx_interactions_customer ON public.interactions(customer_id);
CREATE INDEX idx_interactions_retailer ON public.interactions(retailer_id);
CREATE INDEX idx_interactions_campaign ON public.interactions(campaign_id);
CREATE INDEX idx_interactions_retailer_time ON public.interactions(retailer_id, timestamp DESC);

-- Enable RLS
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retailers
CREATE POLICY "Retailers can view their own data"
  ON public.retailers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Retailers can update their own data"
  ON public.retailers FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for check_ins
CREATE POLICY "Retailers can view their check-ins"
  ON public.check_ins FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can insert check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for flash_promos
CREATE POLICY "Retailers can view their promos"
  ON public.flash_promos FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can insert promos"
  ON public.flash_promos FOR INSERT
  WITH CHECK (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can update their promos"
  ON public.flash_promos FOR UPDATE
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can delete their promos"
  ON public.flash_promos FOR DELETE
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for interactions
CREATE POLICY "Retailers can view their interactions"
  ON public.interactions FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can insert interactions"
  ON public.interactions FOR INSERT
  WITH CHECK (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_retailers
  BEFORE UPDATE ON public.retailers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_check_ins
  BEFORE UPDATE ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_flash_promos
  BEFORE UPDATE ON public.flash_promos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_interactions
  BEFORE UPDATE ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();