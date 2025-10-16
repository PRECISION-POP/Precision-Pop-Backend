-- Fix search_path for auto_disable_flash_promo function
CREATE OR REPLACE FUNCTION public.auto_disable_flash_promo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if stock hit zero and auto-disable is enabled
  IF NEW.stock_remaining <= 0 AND NEW.auto_disable_at_zero = true AND NEW.status = 'active' THEN
    NEW.status = 'autoDisabled';
  END IF;
  
  RETURN NEW;
END;
$$;