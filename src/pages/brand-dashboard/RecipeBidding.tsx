import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, TrendingUp, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface IngredientCategory {
  id: string;
  name: string;
  description: string;
  avg_monthly_searches: number;
}

interface IngredientBid {
  id: string;
  ingredient_keyword: string;
  bid_amount: number;
  product_name: string;
  product_image: string | null;
  product_price: number | null;
  impressions_delivered: number;
  swaps_count: number;
  ingredient_categories: {
    name: string;
  } | null;
}

const RecipeBidding = () => {
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [myBids, setMyBids] = useState<IngredientBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newBid, setNewBid] = useState({
    ingredient_keyword: "",
    category_id: "",
    bid_amount: "",
    product_name: "",
    product_image: "",
    product_price: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("ingredient_categories")
      .select("*")
      .order("avg_monthly_searches", { ascending: false });

    if (!categoriesError) {
      setCategories(categoriesData || []);
    }

    // Fetch my bids
    const brandId = localStorage.getItem("GOD_MODE") === "true" ? "dev-brand-001" : null;
    const { data: bidsData, error: bidsError } = await supabase
      .from("ingredient_bids")
      .select(`
        *,
        ingredient_categories (
          name
        )
      `)
      .eq("brand_id", brandId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!bidsError) {
      setMyBids(bidsData || []);
    }

    setLoading(false);
  };

  const handleCreateBid = async () => {
    if (!newBid.ingredient_keyword || !newBid.bid_amount || !newBid.product_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const brandId = localStorage.getItem("GOD_MODE") === "true" ? "dev-brand-001" : null;

    const { error } = await supabase.from("ingredient_bids").insert([
      {
        brand_id: brandId,
        ingredient_keyword: newBid.ingredient_keyword.toLowerCase(),
        category_id: newBid.category_id || null,
        bid_amount: parseFloat(newBid.bid_amount),
        product_name: newBid.product_name,
        product_image: newBid.product_image || null,
        product_price: newBid.product_price ? parseFloat(newBid.product_price) : null,
      },
    ]);

    if (error) {
      toast({
        title: "Error creating bid",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ingredient bid created!",
      });
      setBidDialogOpen(false);
      setNewBid({
        ingredient_keyword: "",
        category_id: "",
        bid_amount: "",
        product_name: "",
        product_image: "",
        product_price: "",
      });
      fetchData();
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    const { error } = await supabase
      .from("ingredient_bids")
      .update({ status: "inactive" })
      .eq("id", bidId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Bid deactivated",
      });
      fetchData();
    }
  };

  const calculateSwapRate = (bid: IngredientBid) => {
    if (bid.impressions_delivered === 0) return "0%";
    return `${((bid.swaps_count / bid.impressions_delivered) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Recipe Ingredient Bidding</h1>
            <p className="text-muted-foreground">
              Bid on ingredient keywords to place your products in customer shopping lists
            </p>
          </div>

          <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <ChefHat className="w-4 h-4 mr-2" />
                Create Bid
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Ingredient Bid</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Ingredient Keyword *</Label>
                  <Input
                    placeholder="milk, eggs, butter..."
                    value={newBid.ingredient_keyword}
                    onChange={(e) => setNewBid({ ...newBid, ingredient_keyword: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={newBid.category_id}
                    onValueChange={(value) => setNewBid({ ...newBid, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat.avg_monthly_searches.toLocaleString()} monthly searches)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Your Product Name *</Label>
                  <Input
                    placeholder="Horizon Organic Whole Milk"
                    value={newBid.product_name}
                    onChange={(e) => setNewBid({ ...newBid, product_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="4.99"
                      value={newBid.product_price}
                      onChange={(e) => setNewBid({ ...newBid, product_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bid Amount (CPI) *</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="0.0250"
                      value={newBid.bid_amount}
                      onChange={(e) => setNewBid({ ...newBid, bid_amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Product Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={newBid.product_image}
                    onChange={(e) => setNewBid({ ...newBid, product_image: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateBid} className="w-full">
                  Create Bid
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ingredient Categories Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {categories.slice(0, 4).map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {category.avg_monthly_searches.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">monthly searches</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Active Bids */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Active Bids</h2>
          {myBids.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ChefHat className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No ingredient bids yet. Create your first one!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myBids.map((bid) => (
                <Card key={bid.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{bid.ingredient_keyword}</h3>
                          {bid.ingredient_categories && (
                            <Badge variant="outline">{bid.ingredient_categories.name}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Product: {bid.product_name}
                          {bid.product_price && ` • $${bid.product_price.toFixed(2)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bid: ${bid.bid_amount.toFixed(4)} per impression
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Impressions</p>
                          <p className="text-2xl font-bold">{bid.impressions_delivered}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Swap Rate</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {calculateSwapRate(bid)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Spend</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${(bid.bid_amount * bid.impressions_delivered).toFixed(2)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBid(bid.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeBidding;
