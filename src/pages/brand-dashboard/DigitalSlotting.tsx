import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Eye, Gift, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface Coupon {
  id: string;
  title: string;
  brand: string;
  category: string;
  bidding_enabled: boolean;
  impressions: number;
  retailers: {
    name: string;
  };
}

interface CouponBid {
  id: string;
  coupon_id: string;
  bid_amount: number;
  impressions_delivered: number;
  conversions_delivered: number;
}

const DigitalSlotting = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [myBids, setMyBids] = useState<CouponBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const brandId = localStorage.getItem("GOD_MODE") === "true" ? "dev-brand-001" : null;

    if (!brandId) {
      toast({
        title: "Error",
        description: "Brand ID not found",
        variant: "destructive",
      });
      return;
    }

    // Fetch available coupons with bidding enabled
    const { data: couponsData, error: couponsError } = await supabase
      .from("coupons")
      .select(`
        *,
        retailers (
          name
        )
      `)
      .eq("bidding_enabled", true)
      .eq("status", "active");

    if (couponsError) {
      toast({
        title: "Error loading coupons",
        description: couponsError.message,
        variant: "destructive",
      });
    } else {
      setCoupons(couponsData || []);
    }

    // Fetch my bids
    const { data: bidsData, error: bidsError } = await supabase
      .from("coupon_bids")
      .select("*")
      .eq("brand_id", brandId)
      .eq("status", "active");

    if (!bidsError) {
      setMyBids(bidsData || []);
    }

    setLoading(false);
  };

  const handlePlaceBid = async () => {
    if (!selectedCoupon || !bidAmount) {
      toast({
        title: "Error",
        description: "Please enter a bid amount",
        variant: "destructive",
      });
      return;
    }

    const brandId = localStorage.getItem("GOD_MODE") === "true" ? "dev-brand-001" : null;

    const { error } = await supabase.from("coupon_bids").insert([
      {
        coupon_id: selectedCoupon.id,
        brand_id: brandId,
        bid_amount: parseFloat(bidAmount),
        bid_type: "cpi",
        status: "active",
      },
    ]);

    if (error) {
      toast({
        title: "Error placing bid",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Bid placed successfully!",
      });
      setBidDialogOpen(false);
      setBidAmount("");
      setSelectedCoupon(null);
      fetchData();
    }
  };

  const calculateRevenue = (bid: CouponBid) => {
    return (bid.bid_amount * bid.impressions_delivered).toFixed(2);
  };

  const calculateCPA = (bid: CouponBid) => {
    if (bid.conversions_delivered === 0) return "N/A";
    const totalSpent = bid.bid_amount * bid.impressions_delivered;
    return `$${(totalSpent / bid.conversions_delivered).toFixed(2)}`;
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Digital Slotting</h1>
          <p className="text-muted-foreground">
            Bid for priority placement on retailer digital coupons
          </p>
        </div>

        {/* My Active Bids */}
        {myBids.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">My Active Bids</h2>
            <div className="grid gap-4">
              {myBids.map((bid) => {
                const coupon = coupons.find((c) => c.id === bid.coupon_id);
                return (
                  <Card key={bid.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{coupon?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Bid: ${bid.bid_amount.toFixed(4)} per impression
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Impressions</p>
                            <p className="text-2xl font-bold">{bid.impressions_delivered}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Conversions</p>
                            <p className="text-2xl font-bold text-green-600">
                              {bid.conversions_delivered}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">CPA</p>
                            <p className="text-2xl font-bold">{calculateCPA(bid)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Coupon Slots */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Coupon Slots</h2>
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No coupon slots available for bidding</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {coupons.map((coupon) => {
                const myBid = myBids.find((b) => b.coupon_id === coupon.id);
                return (
                  <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{coupon.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {coupon.retailers.name} • {coupon.category}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          <Star className="w-3 h-3 mr-1 fill-green-500" />
                          Bidding Open
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{coupon.impressions} impressions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Est. reach: {Math.floor(coupon.impressions * 1.2)}/mo</span>
                        </div>
                      </div>

                      {myBid ? (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-semibold text-green-600">
                            ✓ You're bidding ${myBid.bid_amount.toFixed(4)} CPI
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {myBid.impressions_delivered} impressions delivered •{" "}
                            {myBid.conversions_delivered} conversions
                          </p>
                        </div>
                      ) : (
                        <Dialog open={bidDialogOpen && selectedCoupon?.id === coupon.id} onOpenChange={setBidDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              onClick={() => setSelectedCoupon(coupon)}
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Place Bid
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Place Bid on {coupon.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label>Bid Amount (Cost Per Impression)</Label>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  placeholder="0.0500"
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Higher bids get priority placement
                                </p>
                              </div>

                              <div className="bg-muted p-3 rounded-lg">
                                <p className="text-sm font-semibold mb-2">Estimated Monthly Cost</p>
                                {bidAmount && (
                                  <p className="text-2xl font-bold text-primary">
                                    ${(
                                      parseFloat(bidAmount) *
                                      coupon.impressions *
                                      1.2
                                    ).toFixed(2)}
                                  </p>
                                )}
                              </div>

                              <Button onClick={handlePlaceBid} className="w-full">
                                Confirm Bid
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalSlotting;
