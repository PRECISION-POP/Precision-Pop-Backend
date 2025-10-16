-- Create storage bucket for campaign assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-assets', 'campaign-assets', true);

-- Create policies for campaign assets
CREATE POLICY "Anyone can view campaign assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-assets');

CREATE POLICY "Brands can upload campaign assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-assets' 
  AND auth.uid() IN (SELECT user_id FROM public.brands)
);

CREATE POLICY "Brands can update their campaign assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'campaign-assets' 
  AND auth.uid() IN (SELECT user_id FROM public.brands)
);

CREATE POLICY "Brands can delete their campaign assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campaign-assets' 
  AND auth.uid() IN (SELECT user_id FROM public.brands)
);