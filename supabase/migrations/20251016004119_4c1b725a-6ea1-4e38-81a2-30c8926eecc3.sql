-- Fix search_path for all functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_campaign_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_flash_promo_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;