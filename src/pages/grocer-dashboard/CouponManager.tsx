import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, DollarSign, Eye, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  title: string;
  description: string;
  brand: string;
  value: number;
  category: string;
  image_url: string;
  expiration: string;
  min_purchase: number;
  max_uses: number;
  status: string;
  bidding_enabled: boolean;
  impressions: number;
  redemptions: number;
}

interface CouponBid {
  id: string;
  brand_id: string;
  bid_amount: number;
  impressions_delivered: number;
  conversions_delivered: number;
  brands: {
    name: string;
  };
}

const CouponManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [couponBids, setCouponBids] = useState<Record<string, CouponBid[]>>({});
  const { toast } = useToast();

  const [newCoupon, setNewCoupon] = useState({
    title: "",
    description: "",
    brand: "",
    value: "",
    category: "Dairy",
    image_url: "",
    expiration: "",
    min_purchase: "0",
    max_uses: "0",
    bidding_enabled: false,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const retailerId = localStorage.getItem('GOD_MODE') === 'true' ? 'dev-retailer-001' : null;
    
    if (!retailerId) {
      toast({
        title: "Error",
        description: "Retailer ID not found",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("retailer_id", retailerId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading coupons",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCoupons(data || []);
      // Fetch bids for each coupon
      data?.forEach(coupon => {
        if (coupon.bidding_enabled) {
          fetchCouponBids(coupon.id);
        }
      });
    }
    setLoading(false);
  };

  const fetchCouponBids = async (couponId: string) => {
    const { data, error } = await supabase
      .from("coupon_bids")
      .select("*")
      .eq("coupon_id", couponId)
      .eq("status", "active");

    if (!error && data) {
      setCouponBids(prev => ({
        ...prev,
        [couponId]: data as any,
      }));
    }
  };

  const handleCreateCoupon = async () => {
    const retailerId = localStorage.getItem('GOD_MODE') === 'true' ? 'dev-retailer-001' : null;
    
    if (!retailerId) {
      toast({
        title: "Error",
        description: "Retailer ID not found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("coupons").insert([
      {
        retailer_id: retailerId,
        title: newCoupon.title,
        description: newCoupon.description,
        brand: newCoupon.brand,
        value: parseFloat(newCoupon.value),
        category: newCoupon.category,
        image_url: newCoupon.image_url,
        expiration: newCoupon.expiration || null,
        min_purchase: parseFloat(newCoupon.min_purchase),
        max_uses: parseInt(newCoupon.max_uses),
        bidding_enabled: newCoupon.bidding_enabled,
      },
    ]);

    if (error) {
      toast({
        title: "Error creating coupon",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
      setCreateDialogOpen(false);
      setNewCoupon({
        title: "",
        description: "",
        brand: "",
        value: "",
        category: "Dairy",
        image_url: "",
        expiration: "",
        min_purchase: "0",
        max_uses: "0",
        bidding_enabled: false,
      });
      fetchCoupons();
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting coupon",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      fetchCoupons();
    }
  };

  const toggleBidding = async (coupon: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ bidding_enabled: !coupon.bidding_enabled })
      .eq("id", coupon.id);

    if (error) {
      toast({
        title: "Error updating coupon",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Brand bidding ${!coupon.bidding_enabled ? "enabled" : "disabled"}`,
      });
      fetchCoupons();
    }
  };

  const calculateRevenue = (bids: CouponBid[]) => {
    return bids.reduce((total, bid) => {
      return total + (bid.bid_amount * bid.impressions_delivered);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Coupon Manager</h1>
            <p className="text-muted-foreground mt-2">
              Create coupons and enable brand bidding for placement
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newCoupon.title}
                      onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                      placeholder="$2 off Horizon Milk"
                    />
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <Input
                      value={newCoupon.brand}
                      onChange={(e) => setNewCoupon({ ...newCoupon, brand: e.target.value })}
                      placeholder="Horizon"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    placeholder="Save $2 on any Horizon Organic Milk product"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Value ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                      placeholder="2.00"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newCoupon.category}
                      onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Produce">Produce</SelectItem>
                        <SelectItem value="Meat">Meat</SelectItem>
                        <SelectItem value="Bakery">Bakery</SelectItem>
                        <SelectItem value="Pantry">Pantry</SelectItem>
                        <SelectItem value="Beverages">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Minimum Purchase ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newCoupon.min_purchase}
                      onChange={(e) => setNewCoupon({ ...newCoupon, min_purchase: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Max Uses (0 = unlimited)</Label>
                    <Input
                      type="number"
                      value={newCoupon.max_uses}
                      onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Expiration Date</Label>
                  <Input
                    type="date"
                    value={newCoupon.expiration}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiration: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={newCoupon.image_url}
                    onChange={(e) => setNewCoupon({ ...newCoupon, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newCoupon.bidding_enabled}
                    onCheckedChange={(checked) =>
                      setNewCoupon({ ...newCoupon, bidding_enabled: checked })
                    }
                  />
                  <Label>Enable Brand Bidding (Digital Slotting)</Label>
                </div>

                <Button onClick={handleCreateCoupon} className="w-full">
                  Create Coupon
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {coupons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Gift className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No coupons yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {coupons.map((coupon) => {
              const bids = couponBids[coupon.id] || [];
              const revenue = calculateRevenue(bids);

              return (
                <Card key={coupon.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{coupon.title}</CardTitle>
                          <Badge variant={coupon.status === "active" ? "default" : "secondary"}>
                            {coupon.status}
                          </Badge>
                          {coupon.bidding_enabled && (
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              Bidding Enabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Brand: {coupon.brand}</span>
                          <span>Value: ${coupon.value}</span>
                          <span>Category: {coupon.category}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Impressions</p>
                          <p className="font-semibold">{coupon.impressions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Redemptions</p>
                          <p className="font-semibold">{coupon.redemptions}</p>
                        </div>
                      </div>
                      {coupon.bidding_enabled && (
                        <>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Revenue from Bids</p>
                              <p className="font-semibold text-green-600">
                                ${revenue.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Active Bids</p>
                            <p className="font-semibold">{bids.length}</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={coupon.bidding_enabled}
                          onCheckedChange={() => toggleBidding(coupon)}
                        />
                        <Label>Enable Brand Bidding</Label>
                      </div>

                      {coupon.bidding_enabled && bids.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedCoupon(selectedCoupon === coupon.id ? null : coupon.id)
                          }
                        >
                          {selectedCoupon === coupon.id ? "Hide" : "Show"} Bids ({bids.length})
                        </Button>
                      )}
                    </div>

                    {selectedCoupon === coupon.id && bids.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold mb-3">Brand Bids</h4>
                        <div className="space-y-2">
                          {bids.map((bid) => (
                            <div
                              key={bid.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{bid.brand_id}</p>
                                <p className="text-sm text-muted-foreground">
                                  Bid: ${bid.bid_amount.toFixed(4)} per impression
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  {bid.impressions_delivered} impressions
                                </p>
                                <p className="font-semibold text-green-600">
                                  ${(bid.bid_amount * bid.impressions_delivered).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponManager;
