import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DigitalSlotting = () => {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState(0);

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const fetchMarketplace = async () => {
    // Fetch available coupon slots with bidding enabled
    const { data: coupons } = await supabase
      .from("coupons")
      .select(`
        *,
        coupon_bids(
          id,
          brand_id,
          bid_amount,
          status,
          impressions_delivered
        )
      `)
      .eq("bidding_enabled", true)
      .eq("status", "active")
      .order("impressions", { ascending: false });

    // Fetch my active bids
    const { data: bids } = await supabase
      .from("coupon_bids")
      .select(`
        *,
        coupons(title, brand, category, impressions)
      `)
      .eq("brand_id", "dev-brand-001")
      .eq("status", "active");

    setAvailableSlots(coupons || []);
    setMyBids(bids || []);
    setLoading(false);
  };

  const placeBid = async () => {
    if (!selectedCoupon || bidAmount <= 0) {
      toast({
        title: "Invalid bid",
        description: "Please enter a valid bid amount",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("coupon_bids")
      .insert({
        coupon_id: selectedCoupon.id,
        brand_id: "dev-brand-001",
        bid_amount: bidAmount,
        bid_type: "cpi",
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
        description: `You're now bidding $${bidAmount.toFixed(2)} per impression`
      });
      
      setBidDialogOpen(false);
      fetchMarketplace();
    }
  };

  const openBidDialog = (coupon: any) => {
    setSelectedCoupon(coupon);
    
    // Suggest a bid 10% higher than current highest
    const currentHighest = coupon.coupon_bids?.reduce((max: number, bid: any) => 
      Math.max(max, bid.bid_amount), 0) || 0;
    setBidAmount(currentHighest > 0 ? Math.ceil(currentHighest * 1.1 * 100) / 100 : 0.05);
    
    setBidDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Digital Slotting Marketplace</h1>
        <p className="text-gray-600">
          Bid for priority placement of coupons. Pay only for impressions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Available Slots</p>
          <p className="text-2xl font-bold">{availableSlots.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">My Active Bids</p>
          <p className="text-2xl font-bold text-primary">{myBids.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Impressions</p>
          <p className="text-2xl font-bold">
            {myBids.reduce((sum, b) => sum + (b.impressions_delivered || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-2xl font-bold text-green-600">
            ${myBids.reduce((sum, b) => 
              sum + ((b.impressions_delivered || 0) * b.bid_amount), 0
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* My Active Bids */}
      {myBids.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">My Active Bids</h2>
          </div>
          <div className="divide-y">
            {myBids.map((bid) => (
              <div key={bid.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{bid.coupons.title}</h3>
                    <p className="text-sm text-gray-600">
                      {bid.coupons.brand} • {bid.coupons.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${bid.bid_amount.toFixed(2)} / impression</p>
                    <p className="text-sm text-gray-600">
                      {bid.impressions_delivered || 0} impressions delivered
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Spent</p>
                    <p className="font-semibold">
                      ${((bid.impressions_delivered || 0) * bid.bid_amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Conversions</p>
                    <p className="font-semibold text-green-600">
                      {bid.conversions_delivered || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">CPA</p>
                    <p className="font-semibold">
                      ${bid.conversions_delivered > 0
                        ? (((bid.impressions_delivered || 0) * bid.bid_amount) / bid.conversions_delivered).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Slots */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Available Coupon Slots</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading marketplace...</div>
        ) : availableSlots.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No available slots at this time</p>
          </div>
        ) : (
          <div className="divide-y">
            {availableSlots.map((coupon) => {
              const highestBid = coupon.coupon_bids?.reduce((max: any, bid: any) => 
                bid.bid_amount > (max?.bid_amount || 0) ? bid : max, null);
              
              const myBid = coupon.coupon_bids?.find((b: any) => b.brand_id === "dev-brand-001");
              
              return (
                <div key={coupon.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{coupon.title}</h3>
                      <p className="text-sm text-gray-600">
                        {coupon.brand} • {coupon.category} • ${coupon.value.toFixed(2)} off
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {myBid && (
                        <Badge variant="default">Your Bid: ${myBid.bid_amount.toFixed(2)}</Badge>
                      )}
                      <Button
                        onClick={() => openBidDialog(coupon)}
                        size="sm"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {myBid ? "Update Bid" : "Place Bid"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Avg Impressions/Day</p>
                      <p className="font-semibold">{Math.floor(coupon.impressions / 7)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Current Highest Bid</p>
                      <p className="font-semibold text-primary">
                        {highestBid ? `$${highestBid.bid_amount.toFixed(2)}` : "No bids"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Competing Brands</p>
                      <p className="font-semibold">{coupon.coupon_bids?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Est. Monthly Cost</p>
                      <p className="font-semibold text-green-600">
                        ${((coupon.impressions / 7) * 30 * (highestBid?.bid_amount || 0.05)).toFixed(0)}
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
            <DialogTitle>Place Bid: {selectedCoupon?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Bid Amount (per impression)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Estimated: {Math.floor((selectedCoupon?.impressions || 0) / 7)} impressions/day
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Estimated Costs</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Per Day:</span>
                  <span className="font-semibold">
                    ${(Math.floor((selectedCoupon?.impressions || 0) / 7) * bidAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Per Week:</span>
                  <span className="font-semibold">
                    ${(Math.floor((selectedCoupon?.impressions || 0) / 7) * 7 * bidAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-bold">Per Month:</span>
                  <span className="font-bold text-primary">
                    ${(Math.floor((selectedCoupon?.impressions || 0) / 7) * 30 * bidAmount).toFixed(2)}
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

export default DigitalSlotting;
