import { useState } from "react";
import { Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ingredientMatcher } from "@/services/RecipeIngredientMatcher";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListItem {
  id: string;
  ingredient: string;
  product_name: string;
  product_image: string | null;
  product_price: number | null;
  is_sponsored: boolean;
  placement_id: string;
}

const SponsoredShoppingList = ({
  recipeId,
  items,
}: {
  recipeId: string;
  items: ShoppingListItem[];
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [alternativesOpen, setAlternativesOpen] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProductSwap = async (placementId: string, newProduct: string) => {
    await ingredientMatcher.trackUserAction(placementId, "swapped", newProduct);

    toast({
      title: "Product Swapped",
      description: "Your preference has been saved",
    });

    setAlternativesOpen(null);
  };

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex gap-3">
            {/* Product Image */}
            <img
              src={item.product_image || "/placeholder-product.png"}
              alt={item.product_name}
              className="w-16 h-16 rounded-lg object-cover"
            />

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{item.ingredient}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.product_name}
                    {item.product_price && ` - $${item.product_price.toFixed(2)}`}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="w-5 h-5 rounded border-gray-300"
                />
              </div>

              {/* Sponsored Badge */}
              {item.is_sponsored && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-500">Sponsored</span>
                  </div>

                  <button
                    onClick={() => setAlternativesOpen(item.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    See alternatives
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Alternatives Dialog */}
          <Dialog
            open={alternativesOpen === item.id}
            onOpenChange={() => setAlternativesOpen(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose Alternative for {item.ingredient}</DialogTitle>
              </DialogHeader>

              <div className="space-y-2 mt-4">
                <button
                  className="w-full p-3 border rounded-lg hover:bg-muted text-left transition-colors"
                  onClick={() => handleProductSwap(item.placement_id, "Generic Brand")}
                >
                  <p className="font-semibold">Generic Brand - $2.99</p>
                  <p className="text-sm text-muted-foreground">Save $1.00</p>
                </button>

                <button
                  className="w-full p-3 border rounded-lg hover:bg-muted text-left transition-colors"
                  onClick={() => handleProductSwap(item.placement_id, "Store Brand")}
                >
                  <p className="font-semibold">Store Brand - $2.49</p>
                  <p className="text-sm text-muted-foreground">Save $1.50</p>
                </button>

                <button
                  className="w-full p-3 border rounded-lg hover:bg-muted text-left transition-colors"
                  onClick={() => handleProductSwap(item.placement_id, "Organic Option")}
                >
                  <p className="font-semibold">Organic Brand - $5.99</p>
                  <p className="text-sm text-muted-foreground">Premium choice</p>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ))}
    </div>
  );
};

export default SponsoredShoppingList;
