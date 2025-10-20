import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Target, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RecipeBidding = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [bidForm, setBidForm] = useState({
    product_name: "",
    product_price: 0,
    bid_amount: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: ingredientData } = await supabase
      .from("ingredient_categories")
      .select(`
        *,
        ingredient_bids(
          id,
          brand_id,
          product_name,
          bid_amount,
          placements_delivered,
          accepted,
          status
        )
      `)
      .order("avg_weekly_imports", { ascending: false });

    const { data: myBidData } = await supabase
      .from("ingredient_bids")
      .select(`
        *,
        ingredient_categories(name, parent_category, avg_weekly_imports)
      `)
      .eq("brand_id", "dev-brand-001");

    setIngredients(ingredientData || []);
    setMyBids(myBidData || []);
    setLoading(false);
  };

  const placeBid = async () => {
    if (!selectedIngredient || bidForm.bid_amount <= 0) {
      toast({
        title: "Invalid bid",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("ingredient_bids")
      .insert({
        brand_id: "dev-brand-001",
        ingredient_category_id: selectedIngredient.id,
        ...bidForm,
        status: "active"
      });

    if (error) {
      toast({
        title: "Error placing bid",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Bid Placed! 🎯",
        description: `You're now the default ${selectedIngredient.name} in imported recipes!`
      });
      
      setBidDialogOpen(false);
      fetchData();
    }
  };

  const openBidDialog = (ingredient: any) => {
    setSelectedIngredient(ingredient);
    const currentHighest = ingredient.ingredient_bids?.reduce((max: number, bid: any) => 
      Math.max(max, bid.bid_amount), 0) || 0;
    
    setBidForm({
      product_name: "",
      product_price: 0,
      bid_amount: currentHighest > 0 ? Math.ceil(currentHighest * 1.1 * 100) / 100 : 0.10,
    });
    
    setBidDialogOpen(true);
  };

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-primary" />
          Recipe Ingredient Bidding
        </h1>
        <p className="text-gray-600">
          Become the default brand when shoppers import recipes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active Bids</p>
          <p className="text-2xl font-bold text-primary">{myBids.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Placements</p>
          <p className="text-2xl font-bold">
            {myBids.reduce((sum, b) => sum + (b.placements_delivered || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Acceptance Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {myBids.reduce((sum, b) => sum + (b.placements_delivered || 0), 0) > 0
              ? Math.round((myBids.reduce((sum, b) => sum + (b.accepted || 0), 0) / 
                  myBids.reduce((sum, b) => sum + (b.placements_delivered || 0), 0)) * 100)
              : 0}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-2xl font-bold text-green-600">
            ${myBids.reduce((sum, b) => 
              sum + ((b.placements_delivered || 0) * b.bid_amount), 0
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* My Active Bids */}
      {myBids.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">My Active Ingredient Bids</h2>
          </div>
          <div className="divide-y">
            {myBids.map((bid) => (
              <div key={bid.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{bid.product_name}</h3>
                    <p className="text-sm text-gray-600">
                      Ingredient: <strong>{bid.ingredient_categories.name}</strong> • ${bid.product_price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-600">Placements</p>
                    <p className="font-semibold">{bid.placements_delivered || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Accepted</p>
                    <p className="font-semibold text-green-600">{bid.accepted || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Spent</p>
                    <p className="font-semibold">
                      ${((bid.placements_delivered || 0) * bid.bid_amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Bid Amount</p>
                    <p className="font-semibold text-primary">${bid.bid_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Ingredients */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Available Ingredients</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ingredients..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredIngredients.map((ingredient) => {
              const myBid = ingredient.ingredient_bids?.find((b: any) => b.brand_id === "dev-brand-001");
              const highestBid = ingredient.ingredient_bids?.reduce((max: any, bid: any) => 
                bid.bid_amount > (max?.bid_amount || 0) ? bid : max, null);

              return (
                <div key={ingredient.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg capitalize">{ingredient.name}</h3>
                        <Badge variant="secondary">{ingredient.parent_category}</Badge>
                        {myBid && <Badge variant="default">You're Bidding</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">
                        Weekly imports: {ingredient.avg_weekly_imports || 0}
                      </p>
                    </div>
                    <Button
                      onClick={() => openBidDialog(ingredient)}
                      size="sm"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {myBid ? "Update Bid" : "Place Bid"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Current Highest Bid</p>
                      <p className="font-semibold text-primary">
                        {highestBid ? `$${highestBid.bid_amount.toFixed(2)}` : "$0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Est. Weekly Cost</p>
                      <p className="font-semibold text-green-600">
                        ${((ingredient.avg_weekly_imports || 0) * (highestBid?.bid_amount || 0.10)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Est. Monthly Cost</p>
                      <p className="font-semibold">
                        ${((ingredient.avg_weekly_imports || 0) * 4 * (highestBid?.bid_amount || 0.10)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bid on: <span className="capitalize">{selectedIngredient?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Your Product Name *</Label>
              <Input
                value={bidForm.product_name}
                onChange={(e) => setBidForm({...bidForm, product_name: e.target.value})}
                placeholder="e.g., Barilla Spaghetti 16oz"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={bidForm.product_price}
                  onChange={(e) => setBidForm({...bidForm, product_price: parseFloat(e.target.value)})}
                  placeholder="3.99"
                />
              </div>

              <div>
                <Label>Bid Amount (per placement) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={bidForm.bid_amount}
                    onChange={(e) => setBidForm({...bidForm, bid_amount: parseFloat(e.target.value)})}
                    className="pl-7"
                    placeholder="0.10"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Estimated Costs</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Per Week:</span>
                  <span className="font-semibold">
                    ${((selectedIngredient?.avg_weekly_imports || 0) * bidForm.bid_amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-bold">Per Month:</span>
                  <span className="font-bold text-primary">
                    ${((selectedIngredient?.avg_weekly_imports || 0) * 4 * bidForm.bid_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={placeBid}>
                Place Bid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeBidding;
