-- Add missing fields to flash_promos
ALTER TABLE public.flash_promos
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS impressions_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accept_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS redemption_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_impact NUMERIC DEFAULT 0;

-- Add bidding fields to campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS daily_budget_cap NUMERIC,
  ADD COLUMN IF NOT EXISTS impressions_delivered INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_delivered INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversions_delivered INTEGER DEFAULT 0;

-- Create offer_impressions table (when offer is shown)
CREATE TABLE public.offer_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  flash_promo_id UUID REFERENCES public.flash_promos(id) ON DELETE CASCADE,
  shown_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  position_in_feed INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create offer_accepts table (swipe right)
CREATE TABLE public.offer_accepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  impression_id UUID REFERENCES public.offer_impressions(id) ON DELETE SET NULL,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create offer_declines table (swipe left)
CREATE TABLE public.offer_declines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  impression_id UUID REFERENCES public.offer_impressions(id) ON DELETE SET NULL,
  declined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create offer_redemptions table (used at checkout)
CREATE TABLE public.offer_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  accept_id UUID REFERENCES public.offer_accepts(id) ON DELETE CASCADE NOT NULL,
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  flash_promo_id UUID REFERENCES public.flash_promos(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  basket_total NUMERIC,
  discount_applied NUMERIC NOT NULL,
  revenue_impact NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for new tables
CREATE INDEX idx_offer_impressions_customer ON public.offer_impressions(customer_id);
CREATE INDEX idx_offer_impressions_offer ON public.offer_impressions(offer_id);
CREATE INDEX idx_offer_impressions_campaign ON public.offer_impressions(campaign_id);
CREATE INDEX idx_offer_impressions_flash_promo ON public.offer_impressions(flash_promo_id);
CREATE INDEX idx_offer_impressions_checkin ON public.offer_impressions(check_in_id);
CREATE INDEX idx_offer_impressions_shown_at ON public.offer_impressions(shown_at DESC);

CREATE INDEX idx_offer_accepts_customer ON public.offer_accepts(customer_id);
CREATE INDEX idx_offer_accepts_offer ON public.offer_accepts(offer_id);
CREATE INDEX idx_offer_accepts_impression ON public.offer_accepts(impression_id);
CREATE INDEX idx_offer_accepts_accepted_at ON public.offer_accepts(accepted_at DESC);

CREATE INDEX idx_offer_declines_customer ON public.offer_declines(customer_id);
CREATE INDEX idx_offer_declines_offer ON public.offer_declines(offer_id);
CREATE INDEX idx_offer_declines_declined_at ON public.offer_declines(declined_at DESC);

CREATE INDEX idx_offer_redemptions_customer ON public.offer_redemptions(customer_id);
CREATE INDEX idx_offer_redemptions_offer ON public.offer_redemptions(offer_id);
CREATE INDEX idx_offer_redemptions_accept ON public.offer_redemptions(accept_id);
CREATE INDEX idx_offer_redemptions_campaign ON public.offer_redemptions(campaign_id);
CREATE INDEX idx_offer_redemptions_flash_promo ON public.offer_redemptions(flash_promo_id);
CREATE INDEX idx_offer_redemptions_redeemed_at ON public.offer_redemptions(redeemed_at DESC);

-- Enable RLS
ALTER TABLE public.offer_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_accepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_declines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offer_impressions
CREATE POLICY "Retailers can view impressions for their customers"
  ON public.offer_impressions FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert impressions"
  ON public.offer_impressions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for offer_accepts
CREATE POLICY "Retailers can view accepts for their customers"
  ON public.offer_accepts FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE retailer_id IN (
        SELECT id FROM public.retailers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert accepts"
  ON public.offer_accepts FOR INSERT
  WITH CHECK (true);

-- RLS Policies for offer_declines
CREATE POLICY "Retailers can view declines for their customers"
  ON public.offer_declines FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE retailer_id IN (
        SELECT id FROM public.retailers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert declines"
  ON public.offer_declines FOR INSERT
  WITH CHECK (true);

-- RLS Policies for offer_redemptions
CREATE POLICY "Retailers can view their redemptions"
  ON public.offer_redemptions FOR SELECT
  USING (
    retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can view campaign redemptions"
  ON public.offer_redemptions FOR SELECT
  USING (
    campaign_id IN (
      SELECT c.id FROM public.campaigns c
      JOIN public.brands b ON c.brand_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert redemptions"
  ON public.offer_redemptions FOR INSERT
  WITH CHECK (true);

-- Create function to update campaign metrics
CREATE OR REPLACE FUNCTION public.update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update impressions count
  IF TG_TABLE_NAME = 'offer_impressions' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE public.campaigns
    SET impressions_delivered = impressions_delivered + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- Update clicks (accepts) count
  IF TG_TABLE_NAME = 'offer_accepts' THEN
    UPDATE public.campaigns
    SET clicks_delivered = clicks_delivered + 1
    WHERE id = (
      SELECT campaign_id FROM public.offers WHERE id = NEW.offer_id
    );
  END IF;
  
  -- Update conversions and budget spent
  IF TG_TABLE_NAME = 'offer_redemptions' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE public.campaigns
    SET 
      conversions_delivered = conversions_delivered + 1,
      budget_spent = budget_spent + (
        SELECT bid_amount FROM public.campaigns WHERE id = NEW.campaign_id
      )
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update flash promo metrics
CREATE OR REPLACE FUNCTION public.update_flash_promo_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update impressions count
  IF TG_TABLE_NAME = 'offer_impressions' AND NEW.flash_promo_id IS NOT NULL THEN
    UPDATE public.flash_promos
    SET impressions_count = impressions_count + 1
    WHERE id = NEW.flash_promo_id;
  END IF;
  
  -- Update accept count
  IF TG_TABLE_NAME = 'offer_accepts' THEN
    UPDATE public.flash_promos
    SET accept_count = accept_count + 1
    WHERE id = (
      SELECT flash_promo_id FROM public.offers WHERE id = NEW.offer_id
    );
  END IF;
  
  -- Update redemption count and revenue impact
  IF TG_TABLE_NAME = 'offer_redemptions' AND NEW.flash_promo_id IS NOT NULL THEN
    UPDATE public.flash_promos
    SET 
      redemption_count = redemption_count + 1,
      revenue_impact = revenue_impact + COALESCE(NEW.revenue_impact, 0)
    WHERE id = NEW.flash_promo_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic metric updates
CREATE TRIGGER update_campaign_on_impression
  AFTER INSERT ON public.offer_impressions
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_metrics();

CREATE TRIGGER update_campaign_on_accept
  AFTER INSERT ON public.offer_accepts
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_metrics();

CREATE TRIGGER update_campaign_on_redemption
  AFTER INSERT ON public.offer_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_metrics();

CREATE TRIGGER update_flash_promo_on_impression
  AFTER INSERT ON public.offer_impressions
  FOR EACH ROW EXECUTE FUNCTION public.update_flash_promo_metrics();

CREATE TRIGGER update_flash_promo_on_accept
  AFTER INSERT ON public.offer_accepts
  FOR EACH ROW EXECUTE FUNCTION public.update_flash_promo_metrics();

CREATE TRIGGER update_flash_promo_on_redemption
  AFTER INSERT ON public.offer_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_flash_promo_metrics();