import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Plus, Trash2, DollarSign, Eye, Gift, ArrowLeft, TrendingUp, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Demo mock data for investor presentation
const DEMO_COUPONS = [
  {
    id: "demo-coup-1",
    title: "$2 off Horizon Organic Milk",
    description: "Save $2 on any Horizon Organic Milk 64oz or larger",
    brand: "Horizon",
    value: 2.00,
    category: "Dairy",
    image_url: "",
    expiration: "2024-03-15",
    min_purchase: 0,
    max_uses: 500,
    status: "active",
    bidding_enabled: true,
    impressions: 2847,
    redemptions: 412
  },
  {
    id: "demo-coup-2",
    title: "$1.50 off Chobani Greek Yogurt",
    description: "Save $1.50 on any Chobani 4-pack",
    brand: "Chobani",
    value: 1.50,
    category: "Dairy",
    image_url: "",
    expiration: "2024-03-20",
    min_purchase: 5,
    max_uses: 300,
    status: "active",
    bidding_enabled: true,
    impressions: 1892,
    redemptions: 287
  },
  {
    id: "demo-coup-3",
    title: "BOGO HEB Brand Bread",
    description: "Buy one get one free on HEB Bakery Bread",
    brand: "HEB",
    value: 3.49,
    category: "Bakery",
    image_url: "",
    expiration: "2024-03-10",
    min_purchase: 0,
    max_uses: 200,
    status: "active",
    bidding_enabled: false,
    impressions: 956,
    redemptions: 178
  }
];

const DEMO_BIDS = {
  "demo-coup-1": [
    { id: "bid-1", brand_id: "dev-brand-002", bid_amount: 0.015, impressions_delivered: 1423, conversions_delivered: 198 },
    { id: "bid-2", brand_id: "dev-brand-003", bid_amount: 0.012, impressions_delivered: 890, conversions_delivered: 124 }
  ],
  "demo-coup-2": [
    { id: "bid-3", brand_id: "dev-brand-001", bid_amount: 0.018, impressions_delivered: 1200, conversions_delivered: 156 }
  ]
};

// Brand name mapping for display
const brandNames: Record<string, string> = {
  'dev-brand-001': 'Horizon Organic',
  'dev-brand-002': 'Organic Valley',
  'dev-brand-003': 'Oatly',
};

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
}

const CouponManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(DEMO_COUPONS);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [couponBids, setCouponBids] = useState<Record<string, CouponBid[]>>(DEMO_BIDS);
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
    // 🔓 DEMO MODE: Pre-loaded with mock data
    console.log('🔓 DEMO MODE: CouponManager loaded with mock data');
  }, []);

  const handleCreateCoupon = async () => {
    // Demo: Just add to local state
    const newId = `demo-coup-${Date.now()}`;
    const coupon: Coupon = {
      id: newId,
      title: newCoupon.title,
      description: newCoupon.description,
      brand: newCoupon.brand,
      value: parseFloat(newCoupon.value),
      category: newCoupon.category,
      image_url: newCoupon.image_url,
      expiration: newCoupon.expiration,
      min_purchase: parseFloat(newCoupon.min_purchase),
      max_uses: parseInt(newCoupon.max_uses),
      status: "active",
      bidding_enabled: newCoupon.bidding_enabled,
      impressions: 0,
      redemptions: 0
    };

    setCoupons([coupon, ...coupons]);
    toast({
      title: "✅ Coupon Created!",
      description: `"${coupon.title}" is now active`,
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
  };

  const handleDeleteCoupon = async (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast({ title: "Coupon Deleted", description: "Coupon removed successfully" });
  };

  const toggleBidding = (coupon: Coupon) => {
    setCoupons(coupons.map(c => 
      c.id === coupon.id ? { ...c, bidding_enabled: !c.bidding_enabled } : c
    ));
    toast({
      title: "Updated",
      description: `Brand bidding ${!coupon.bidding_enabled ? "enabled" : "disabled"}`,
    });
  };

  const calculateRevenue = (bids: CouponBid[]) => {
    return bids.reduce((total, bid) => {
      return total + (bid.bid_amount * bid.impressions_delivered);
    }, 0);
  };

  // Calculate total bidding revenue
  const totalBiddingRevenue = Object.values(couponBids).flat().reduce((total, bid) => {
    return total + (bid.bid_amount * bid.impressions_delivered);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 tablet-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/grocer-dashboard">
            <Button variant="ghost" size="icon" className="h-14 w-14">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-primary" />
              <h1 className="demo-heading text-gray-900">Coupon Manager</h1>
            </div>
            <p className="text-lg text-gray-600 mt-1">
              Create coupons and enable brand bidding for premium placement
            </p>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Total Brand Bidding Revenue
              </p>
              <p className="text-5xl font-bold">${totalBiddingRevenue.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 mb-1">Active Coupons</p>
              <p className="text-4xl font-bold">{coupons.filter(c => c.bidding_enabled).length}</p>
              <p className="text-green-200 text-sm">with bidding enabled</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-16 px-8 text-xl bg-primary hover:bg-primary/90">
                <Plus className="w-6 h-6 mr-3" />
                Create New Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Coupon</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base">Coupon Title</Label>
                    <Input
                      value={newCoupon.title}
                      onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                      placeholder="$2 off Horizon Milk"
                      className="h-12 text-lg mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-base">Brand</Label>
                    <Input
                      value={newCoupon.brand}
                      onChange={(e) => setNewCoupon({ ...newCoupon, brand: e.target.value })}
                      placeholder="Horizon"
                      className="h-12 text-lg mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base">Description</Label>
                  <Textarea
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    placeholder="Save $2 on any Horizon Organic Milk product"
                    className="text-lg mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base">Value ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                      placeholder="2.00"
                      className="h-12 text-lg mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-base">Category</Label>
                    <Select
                      value={newCoupon.category}
                      onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}
                    >
                      <SelectTrigger className="h-12 text-lg mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dairy" className="text-lg py-3">Dairy</SelectItem>
                        <SelectItem value="Produce" className="text-lg py-3">Produce</SelectItem>
                        <SelectItem value="Meat" className="text-lg py-3">Meat</SelectItem>
                        <SelectItem value="Bakery" className="text-lg py-3">Bakery</SelectItem>
                        <SelectItem value="Pantry" className="text-lg py-3">Pantry</SelectItem>
                        <SelectItem value="Beverages" className="text-lg py-3">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base">Min Purchase ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newCoupon.min_purchase}
                      onChange={(e) => setNewCoupon({ ...newCoupon, min_purchase: e.target.value })}
                      placeholder="0.00"
                      className="h-12 text-lg mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-base">Max Uses (0 = unlimited)</Label>
                    <Input
                      type="number"
                      value={newCoupon.max_uses}
                      onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                      placeholder="0"
                      className="h-12 text-lg mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base">Expiration Date</Label>
                  <Input
                    type="date"
                    value={newCoupon.expiration}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiration: e.target.value })}
                    className="h-12 text-lg mt-2"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div>
                    <Label className="text-lg font-semibold text-green-800">Enable Brand Bidding</Label>
                    <p className="text-green-600 text-sm mt-1">
                      Allow brands to bid for premium coupon placement
                    </p>
                  </div>
                  <Switch
                    checked={newCoupon.bidding_enabled}
                    onCheckedChange={(checked) =>
                      setNewCoupon({ ...newCoupon, bidding_enabled: checked })
                    }
                    className="scale-125"
                  />
                </div>

                <Button onClick={handleCreateCoupon} className="w-full h-14 text-xl">
                  Create Coupon
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Coupon List */}
        <div className="space-y-6">
          {coupons.map((coupon) => {
            const bids = couponBids[coupon.id] || [];
            const revenue = calculateRevenue(bids);
            const redemptionRate = coupon.impressions > 0 
              ? ((coupon.redemptions / coupon.impressions) * 100).toFixed(1)
              : "0";

            return (
              <Card key={coupon.id} className="border-2 border-gray-100 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{coupon.title}</CardTitle>
                        <Badge variant="default" className="text-base px-3 py-1">
                          {coupon.status}
                        </Badge>
                        {coupon.bidding_enabled && (
                          <Badge variant="outline" className="border-green-500 text-green-600 text-base px-3 py-1">
                            💰 Bidding Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg text-gray-600">{coupon.description}</p>
                      <div className="flex items-center gap-6 mt-3 text-base text-gray-500">
                        <span>Brand: <strong>{coupon.brand}</strong></span>
                        <span>Value: <strong className="text-green-600">${coupon.value.toFixed(2)}</strong></span>
                        <span>Category: {coupon.category}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="h-12 w-12"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Metrics Row */}
                  <div className="grid grid-cols-4 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <Eye className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Impressions</p>
                        <p className="text-2xl font-bold text-gray-900">{coupon.impressions.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Gift className="w-6 h-6 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500">Redemptions</p>
                        <p className="text-2xl font-bold text-gray-900">{coupon.redemptions} <span className="text-base font-normal text-gray-500">({redemptionRate}%)</span></p>
                      </div>
                    </div>
                    {coupon.bidding_enabled && (
                      <>
                        <div className="flex items-center gap-3 money-flow-card rounded-lg bg-green-50 p-3 -m-3">
                          <DollarSign className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Bid Revenue</p>
                            <p className="text-2xl font-bold text-green-600">${revenue.toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Active Bids</p>
                          <p className="text-2xl font-bold text-gray-900">{bids.length}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bidding Toggle & Show Bids */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={coupon.bidding_enabled}
                        onCheckedChange={() => toggleBidding(coupon)}
                        className="scale-110"
                      />
                      <Label className="text-base">Enable Brand Bidding</Label>
                    </div>

                    {coupon.bidding_enabled && bids.length > 0 && (
                      <Button
                        variant="outline"
                        className="h-12 px-5 text-base"
                        onClick={() =>
                          setSelectedCoupon(selectedCoupon === coupon.id ? null : coupon.id)
                        }
                      >
                        {selectedCoupon === coupon.id ? "Hide" : "View"} Bids ({bids.length})
                      </Button>
                    )}
                  </div>

                  {/* Brand Bids Expanded */}
                  {selectedCoupon === coupon.id && bids.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Brand Bids — Revenue Flow
                      </h4>
                      <div className="space-y-3">
                        {bids.map((bid, index) => (
                          <div
                            key={bid.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900">
                                  {brandNames[bid.brand_id] || bid.brand_id}
                                </p>
                                <p className="text-base text-gray-600">
                                  Bid: ${bid.bid_amount.toFixed(4)} per impression
                                </p>
                              </div>
                            </div>
                            <div className="text-right money-flow-card rounded-lg bg-green-50 px-4 py-2">
                              <p className="text-sm text-gray-500">
                                {bid.impressions_delivered.toLocaleString()} impressions
                              </p>
                              <p className="text-xl font-bold text-green-600">
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
      </div>
    </div>
  );
};

export default CouponManager;
