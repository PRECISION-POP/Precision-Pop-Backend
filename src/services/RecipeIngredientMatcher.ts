import { supabase } from "@/integrations/supabase/client";

interface IngredientBid {
  id: string;
  brand_id: string;
  ingredient_keyword: string;
  bid_amount: number;
  product_name: string;
  product_image: string | null;
  product_price: number | null;
  impressions_delivered: number;
}

class RecipeIngredientMatcher {
  /**
   * Match recipe ingredients to winning brand bids
   */
  async matchIngredientsToProducts(
    recipeImportId: string,
    ingredients: string[]
  ): Promise<any[]> {
    const placements = [];

    for (const ingredient of ingredients) {
      const normalizedIngredient = ingredient.toLowerCase().trim();
      
      // Find highest bidder for this ingredient
      const { data: bids, error } = await supabase
        .from("ingredient_bids")
        .select("*")
        .eq("status", "active")
        .ilike("ingredient_keyword", `%${normalizedIngredient}%`)
        .order("bid_amount", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching bids:", error);
        continue;
      }

      const winningBid = bids && bids.length > 0 ? bids[0] : null;

      // Create placement record
      const placement = {
        recipe_import_id: recipeImportId,
        ingredient: ingredient,
        winning_bid_id: winningBid?.id || null,
        product_name: winningBid?.product_name || `Generic ${ingredient}`,
        product_image: winningBid?.product_image || null,
        product_price: winningBid?.product_price || 3.99,
        is_sponsored: !!winningBid,
      };

      const { data: insertedPlacement, error: insertError } = await supabase
        .from("ingredient_placements")
        .insert([placement])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating placement:", insertError);
        continue;
      }

      placements.push(insertedPlacement);

      // Increment impressions for winning bid
      if (winningBid) {
        await this.incrementImpression(winningBid.id);
      }
    }

    return placements;
  }

  /**
   * Track when user swaps a sponsored product
   */
  async trackUserAction(
    placementId: string,
    action: "swapped" | "kept",
    swappedToProduct?: string
  ) {
    const updateData: any = {
      user_swapped: action === "swapped",
    };

    if (swappedToProduct) {
      updateData.swapped_to_product = swappedToProduct;
    }

    const { error } = await supabase
      .from("ingredient_placements")
      .update(updateData)
      .eq("id", placementId);

    if (error) {
      console.error("Error tracking user action:", error);
      return;
    }

    // If swapped, increment swap count on the bid
    if (action === "swapped") {
      const { data: placement } = await supabase
        .from("ingredient_placements")
        .select("winning_bid_id")
        .eq("id", placementId)
        .single();

      if (placement?.winning_bid_id) {
        await this.incrementSwapCount(placement.winning_bid_id);
      }
    }
  }

  /**
   * Increment impression count for a bid
   */
  private async incrementImpression(bidId: string) {
    const { data: bid } = await supabase
      .from("ingredient_bids")
      .select("impressions_delivered")
      .eq("id", bidId)
      .maybeSingle();

    if (bid) {
      await supabase
        .from("ingredient_bids")
        .update({ impressions_delivered: bid.impressions_delivered + 1 })
        .eq("id", bidId);
    }
  }

  /**
   * Increment swap count when user rejects sponsored product
   */
  private async incrementSwapCount(bidId: string) {
    const { data: bid } = await supabase
      .from("ingredient_bids")
      .select("swaps_count")
      .eq("id", bidId)
      .single();

    if (bid) {
      await supabase
        .from("ingredient_bids")
        .update({ swaps_count: bid.swaps_count + 1 })
        .eq("id", bidId);
    }
  }

  /**
   * Get placement performance for a recipe
   */
  async getRecipePlacements(recipeImportId: string) {
    const { data, error } = await supabase
      .from("ingredient_placements")
      .select(`
        *,
        ingredient_bids (
          brand_id,
          bid_amount,
          brands (
            name
          )
        )
      `)
      .eq("recipe_import_id", recipeImportId);

    if (error) {
      console.error("Error fetching placements:", error);
      return [];
    }

    return data;
  }
}

export const ingredientMatcher = new RecipeIngredientMatcher();
