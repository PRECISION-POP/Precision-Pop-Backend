-- Auto-disable flash promos when stock hits zero
CREATE OR REPLACE FUNCTION public.auto_disable_flash_promo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if stock hit zero and auto-disable is enabled
  IF NEW.stock_remaining <= 0 AND NEW.auto_disable_at_zero = true AND NEW.status = 'active' THEN
    NEW.status = 'autoDisabled';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on flash_promos
DROP TRIGGER IF EXISTS trigger_auto_disable_flash_promo ON public.flash_promos;
CREATE TRIGGER trigger_auto_disable_flash_promo
  BEFORE UPDATE ON public.flash_promos
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_disable_flash_promo();