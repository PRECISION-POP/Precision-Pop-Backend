-- Drop ALL policies that reference campaigns.brand_id
DROP POLICY IF EXISTS "Brands can delete their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brands can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brands can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brands can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brands can manage campaign offers" ON offers;
DROP POLICY IF EXISTS "Brands can view campaign redemptions" ON offer_redemptions;

-- Drop foreign key constraint
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_brand_id_fkey;

-- Alter campaigns.brand_id to TEXT for MVP
ALTER TABLE campaigns 
  ALTER COLUMN brand_id TYPE text USING brand_id::text;

-- Recreate MVP-friendly policies (permissive for dev)
CREATE POLICY "Allow all campaign operations (MVP)"
ON campaigns FOR ALL
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all offer operations (MVP)"
ON offers FOR ALL
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all redemption views (MVP)"
ON offer_redemptions FOR SELECT
USING (true);