import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BarChart3, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Campaign {
  id: string;
  name: string;
  status: string;
  impressions_delivered: number;
  clicks_delivered: number;
  conversions_delivered: number;
  budget_spent: number;
  budget_total: number;
  target_segments: string[];
  start_date: string;
  end_date: string;
  bid_amount: number;
  bid_type: string;
}

interface Redemption {
  basket_total: number;
  discount_applied: number;
  redeemed_at: string;
}

const CampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    if (!campaignId) return;

    // Fetch campaign data
    const { data: campaignData, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError) {
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
      navigate("/brand-dashboard");
      return;
    }

    // Fetch redemptions for this campaign
    const { data: redemptionData } = await supabase
      .from("offer_redemptions")
      .select("basket_total, discount_applied, redeemed_at")
      .eq("campaign_id", campaignId)
      .order("redeemed_at", { ascending: false });

    setCampaign(campaignData);
    setRedemptions(redemptionData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) return null;

  const ctr = campaign.impressions_delivered > 0 
    ? ((campaign.clicks_delivered / campaign.impressions_delivered) * 100).toFixed(2)
    : "0.00";
  
  const conversionRate = campaign.clicks_delivered > 0
    ? ((campaign.conversions_delivered / campaign.clicks_delivered) * 100).toFixed(2)
    : "0.00";

  const totalRevenue = redemptions.reduce((sum, r) => sum + (Number(r.basket_total) || 0), 0);
  const spent = Number(campaign.budget_spent) || 0;
  const roas = spent > 0 ? (totalRevenue / spent).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/brand-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
              <p className="text-gray-600">
                {campaign.target_segments?.join(", ") || "All Segments"}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              campaign.status === "active" 
                ? "bg-green-100 text-green-800"
                : campaign.status === "draft"
                ? "bg-gray-100 text-gray-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-600">Impressions</p>
            </div>
            <p className="text-3xl font-bold">{campaign.impressions_delivered.toLocaleString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-600">Click-Through Rate</p>
            </div>
            <p className="text-3xl font-bold">{ctr}%</p>
            <p className="text-sm text-gray-600 mt-1">{campaign.clicks_delivered} clicks</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-600">Conversions</p>
            </div>
            <p className="text-3xl font-bold">{campaign.conversions_delivered}</p>
            <p className="text-sm text-gray-600 mt-1">{conversionRate}% conversion rate</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-600">ROAS</p>
            </div>
            <p className="text-3xl font-bold text-primary">{roas}x</p>
            <p className="text-sm text-gray-600 mt-1">${totalRevenue.toFixed(0)} revenue</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Campaign Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Bid Type:</span>
                <span className="font-semibold">{campaign.bid_type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bid Amount:</span>
                <span className="font-semibold">${Number(campaign.bid_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Budget Spent:</span>
                <span className="font-semibold">${spent.toFixed(0)} / ${Number(campaign.budget_total).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-semibold">{new Date(campaign.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-semibold">{new Date(campaign.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-semibold text-green-600">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Discounts:</span>
                <span className="font-semibold">${redemptions.reduce((sum, r) => sum + Number(r.discount_applied), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Redemptions:</span>
                <span className="font-semibold">{redemptions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Basket:</span>
                <span className="font-semibold">
                  ${redemptions.length > 0 ? (totalRevenue / redemptions.length).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Redemptions</h2>
          {redemptions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No redemptions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Basket Total</th>
                    <th className="text-right py-3 px-4">Discount Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.slice(0, 10).map((redemption, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(redemption.redeemed_at).toLocaleString()}</td>
                      <td className="text-right py-3 px-4">${Number(redemption.basket_total).toFixed(2)}</td>
                      <td className="text-right py-3 px-4 text-green-600">-${Number(redemption.discount_applied).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CampaignDetails;
