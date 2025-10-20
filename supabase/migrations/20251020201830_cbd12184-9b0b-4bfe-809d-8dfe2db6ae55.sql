-- Enable RLS on tables
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_bids ENABLE ROW LEVEL SECURITY;

-- MVP-friendly policies (permissive for dev, can be tightened later with auth)

-- Coupons: Allow all operations for development
CREATE POLICY "Allow all coupon operations (MVP)"
ON coupons
FOR ALL
USING (true)
WITH CHECK (true);

-- Coupon bids: Allow all operations for development  
CREATE POLICY "Allow all coupon bid operations (MVP)"
ON coupon_bids
FOR ALL
USING (true)
WITH CHECK (true);

-- Ingredient bids: Allow all operations for development
CREATE POLICY "Allow all ingredient bid operations (MVP)"
ON ingredient_bids
FOR ALL
USING (true)
WITH CHECK (true);