-- Enable realtime updates for coupon_bids table
ALTER PUBLICATION supabase_realtime ADD TABLE coupon_bids;

-- Enable realtime for ingredient_bids as well for future use
ALTER PUBLICATION supabase_realtime ADD TABLE ingredient_bids;

-- Enable realtime for coupons table so brands see when new slots open
ALTER PUBLICATION supabase_realtime ADD TABLE coupons;