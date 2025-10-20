-- Enable RLS on remaining tables for MVP
ALTER TABLE ingredient_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_imports ENABLE ROW LEVEL SECURITY;

-- Create MVP-friendly policies (permissive for dev)
CREATE POLICY "Allow all operations on ingredient_categories (MVP)"
ON ingredient_categories FOR ALL
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ingredient_placements (MVP)"
ON ingredient_placements FOR ALL
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on recipe_imports (MVP)"
ON recipe_imports FOR ALL
USING (true) WITH CHECK (true);