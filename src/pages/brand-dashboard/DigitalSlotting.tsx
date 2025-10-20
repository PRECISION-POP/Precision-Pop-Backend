import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, AlertTriangle, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BidAnalyticsChart from "@/components/BidAnalyticsChart";

const DigitalSlotting = () => {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const previousHighestBids = useRef<Record<string, { amount: number; brand: string }>>({});

  useEffect(() => {
    console.log('💡 DigitalSlotting component mounted - fetching initial data');
    fetchMarketplace();
    generateAnalytics();

    // Real-time subscription for bid updates
    console.log('🔌 Setting up realtime subscriptions...');
    const bidsChannel = supabase
      .channel('coupon_bids_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coupon_bids' },
        (payload) => {
          console.log('🔔 Real-time: Coupon bid changed!', payload);
          fetchMarketplace();
          generateAnalytics();
        }
      )
      .subscribe((status) => {
        console.log('📡 Coupon bids subscription status:', status);
      });

    // Subscribe to coupons table changes too
    const couponsChannel = supabase
      .channel('coupons_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coupons' },
        (payload) => {
          console.log('🔔 Real-time: Coupon changed!', payload);
          fetchMarketplace();
        }
      )
      .subscribe((status) => {
        console.log('📡 Coupons subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up realtime subscriptions');
      supabase.removeChannel(bidsChannel);
      supabase.removeChannel(couponsChannel);
    };
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
          impressions_delivered,
          daily_budget
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

    // Check for outbid scenarios
    coupons?.forEach((coupon) => {
      const highestBid = coupon.coupon_bids?.reduce((max: any, bid: any) => 
        bid.bid_amount > (max?.bid_amount || 0) ? bid : max, null);
      
      const myBid = coupon.coupon_bids?.find((b: any) => b.brand_id === "dev-brand-001");
      const prevHighest = previousHighestBids.current[coupon.id];
      
      // Detect if we've been outbid
      if (myBid && highestBid && highestBid.brand_id !== "dev-brand-001" && prevHighest) {
        if (prevHighest.brand === "dev-brand-001" && highestBid.brand_id !== "dev-brand-001") {
          toast({
            title: "⚠️ You've been outbid!",
            description: `${coupon.title}: New highest bid is $${highestBid.bid_amount.toFixed(2)}`,
            variant: "destructive"
          });
        }
      }
      
      // Store current highest for next comparison
      if (highestBid) {
        previousHighestBids.current[coupon.id] = {
          amount: highestBid.bid_amount,
          brand: highestBid.brand_id
        };
      }
    });

    setAvailableSlots(coupons || []);
    setMyBids(bids || []);
    setLoading(false);
  };

  const generateAnalytics = () => {
    // Generate mock analytics data for the last 7 days
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: Math.floor(Math.random() * 100) + 50,
        clicks: Math.floor(Math.random() * 20) + 5,
        conversions: Math.floor(Math.random() * 5) + 1,
      });
    }
    
    setAnalyticsData(data);
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

      {/* Bid Analytics Chart */}
      {myBids.length > 0 && (
        <div className="mb-8">
          <BidAnalyticsChart data={analyticsData} />
        </div>
      )}

      {/* My Active Bids */}
      {myBids.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">My Active Bids</h2>
          </div>
          <div className="divide-y">
            {myBids.map((bid) => {
              const totalSpent = (bid.impressions_delivered || 0) * bid.bid_amount;
              const dailySpend = bid.daily_budget || 0;
              const budgetUsed = dailySpend > 0 ? (totalSpent / dailySpend) : 0;
              const burnRate = bid.impressions_delivered > 0 
                ? totalSpent / Math.max(1, Math.ceil((new Date().getTime() - new Date(bid.created_at).getTime()) / (1000 * 60 * 60 * 24)))
                : 0;
              
              return (
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
                  
                  {/* Budget Tracking */}
                  {dailySpend > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Daily Budget Tracking</span>
                        <span className="text-sm text-gray-600">
                          ${totalSpent.toFixed(2)} / ${dailySpend.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            budgetUsed >= 1 ? 'bg-red-500' : 
                            budgetUsed >= 0.8 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetUsed * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span>Burn rate: ${burnRate.toFixed(2)}/day</span>
                        <span>{Math.round(budgetUsed * 100)}% used</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Budget Alert */}
                  {dailySpend > 0 && budgetUsed > 0.8 && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {budgetUsed >= 1 
                          ? '🚨 Daily budget exceeded! Bid may be paused.' 
                          : `⚠️ ${Math.round(budgetUsed * 100)}% of daily budget used`}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Total Spent</p>
                      <p className="font-semibold">
                        ${totalSpent.toFixed(2)}
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
                          ? (totalSpent / bid.conversions_delivered).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Empty state for no bids */}
      {myBids.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow mb-8 p-12 text-center">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Bids</h3>
          <p className="text-gray-600">Place your first bid on a coupon slot below to start reaching customers.</p>
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
                      {myBid && highestBid?.brand_id === "dev-brand-001" && (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winning Bid
                        </Badge>
                      )}
                      {myBid && highestBid?.brand_id !== "dev-brand-001" && (
                        <Badge variant="secondary">Your Bid: ${myBid.bid_amount.toFixed(2)}</Badge>
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
