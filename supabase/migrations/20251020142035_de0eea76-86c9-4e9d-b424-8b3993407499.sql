-- Coupons table (core feature for grocers)
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
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

-- Coupon bids from brands
CREATE TABLE public.coupon_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  bid_amount NUMERIC(10,4) NOT NULL,
  bid_type TEXT DEFAULT 'cpi',
  status TEXT DEFAULT 'active',
  impressions_delivered INTEGER DEFAULT 0,
  conversions_delivered INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_coupons_retailer ON public.coupons(retailer_id);
CREATE INDEX idx_coupons_status ON public.coupons(status);
CREATE INDEX idx_coupon_bids_coupon ON public.coupon_bids(coupon_id);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Retailers can view their coupons"
  ON public.coupons FOR SELECT
  USING (retailer_id IN (
    SELECT id FROM public.retailers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Retailers can insert their coupons"
  ON public.coupons FOR INSERT
  WITH CHECK (retailer_id IN (
    SELECT id FROM public.retailers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Retailers can update their coupons"
  ON public.coupons FOR UPDATE
  USING (retailer_id IN (
    SELECT id FROM public.retailers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Retailers can delete their coupons"
  ON public.coupons FOR DELETE
  USING (retailer_id IN (
    SELECT id FROM public.retailers WHERE user_id = auth.uid()
  ));

-- RLS Policies for coupon_bids
CREATE POLICY "Retailers can view bids on their coupons"
  ON public.coupon_bids FOR SELECT
  USING (coupon_id IN (
    SELECT id FROM public.coupons 
    WHERE retailer_id IN (
      SELECT id FROM public.retailers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Brands can view their bids"
  ON public.coupon_bids FOR SELECT
  USING (brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can insert bids"
  ON public.coupon_bids FOR INSERT
  WITH CHECK (brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  ));

CREATE POLICY "Brands can update their bids"
  ON public.coupon_bids FOR UPDATE
  USING (brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  ));

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();