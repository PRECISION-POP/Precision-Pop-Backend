import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign, Target, Users, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandDashboardLayout from "@/components/BrandDashboardLayout";

// Demo segments for presentation
const DEMO_SEGMENTS = [
  "Health Conscious Shoppers",
  "Organic Buyers",
  "Family Households", 
  "Budget Conscious",
  "Premium Buyers",
  "Competitor Brand Loyalists",
  "Frequent Dairy Buyers",
  "Weekend Shoppers"
];

// Demo stores for presentation
const DEMO_STORES = [
  { id: "store-1", name: "HEB Mueller", retailer: "HEB" },
  { id: "store-2", name: "HEB Lakeline", retailer: "HEB" },
  { id: "store-3", name: "HEB Downtown", retailer: "HEB" },
  { id: "store-4", name: "Whole Foods Domain", retailer: "Whole Foods" }
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [brandId, setBrandId] = useState<string | null>('dev-brand-001');
  const [loading, setLoading] = useState(false);
  const [availableSegments, setAvailableSegments] = useState<string[]>(DEMO_SEGMENTS);
  const [availableStores, setAvailableStores] = useState(DEMO_STORES);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    product_name: "",
    sku: "",
    budget_total: "",
    bid_amount: "",
    bid_type: "cpm" as "cpm" | "cpc" | "cpa",
    target_segments: location.state?.targetSegment ? [location.state.targetSegment] : [],
    discount_value: "",
    start_date: "",
    end_date: "",
    creative_url: "",
    daily_budget_cap: "",
  });

  useEffect(() => {
    // 🔓 DEMO MODE: Pre-configured
    console.log('🔓 DEMO MODE: CreateCampaign loaded');
  }, []);

  // Calculate estimated metrics for preview
  const estimatedImpressions = formData.budget_total && formData.bid_amount 
    ? Math.floor((parseFloat(formData.budget_total) / parseFloat(formData.bid_amount)) * 1000)
    : 0;
  
  const estimatedReach = Math.floor(estimatedImpressions * 0.65); // Assume 65% unique reach
  const estimatedConversions = Math.floor(estimatedImpressions * 0.032); // 3.2% conversion rate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Persist the campaign draft on this device so it shows up in the
    // dashboard list. (Server-side persistence lands with brand auth.)
    try {
      const draft = {
        id: `draft-${Date.now()}`,
        name: formData.name || "Untitled campaign",
        status: "draft",
        impressions_delivered: 0,
        clicks_delivered: 0,
        conversions_delivered: 0,
        budget_spent: 0,
        budget_total: parseFloat(formData.budget_total) || 0,
        target_segments: formData.target_segments,
      };
      const existing = JSON.parse(localStorage.getItem("ppop_campaign_drafts") || "[]");
      localStorage.setItem("ppop_campaign_drafts", JSON.stringify([draft, ...existing]));
      toast({
        title: "Campaign draft saved",
        description: `"${draft.name}" is saved on this device and listed below.`,
      });
    } catch {
      toast({
        title: "Could not save",
        description: "Browser storage is unavailable; the campaign was not saved.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate("/brand-dashboard");
  };

  return (
    <BrandDashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 tablet-padding">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-14 w-14">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="demo-heading text-gray-900 flex items-center gap-3">
                <Zap className="w-8 h-8 text-purple-500" />
                Create New Campaign
              </h1>
              <p className="text-lg text-gray-600 mt-1">Target your ideal customers with precision</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - 2/3 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Campaign Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campaign Name */}
                    <div className="space-y-2">
                      <Label className="text-base">Campaign Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Spring Sale - Organic Milk"
                        className="h-14 text-lg"
                        required
                      />
                    </div>

                    {/* Product Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base">Product Name</Label>
                        <Input
                          value={formData.product_name}
                          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                          placeholder="e.g., Organic Whole Milk"
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base">SKU</Label>
                        <Input
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g., MILK-ORG-001"
                          className="h-12 text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Targeting - Prominent for Demo */}
                    <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-6 h-6 text-purple-600" />
                        <Label className="text-lg font-semibold text-purple-900">Audience Targeting</Label>
                      </div>
                      <Select
                        value={formData.target_segments[0] || ""}
                        onValueChange={(value) => 
                          setFormData({ ...formData, target_segments: [value] })
                        }
                      >
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue placeholder="Select target segment..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSegments.map(segment => (
                            <SelectItem key={segment} value={segment} className="text-base py-3">
                              {segment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-purple-600 mt-2">
                        Reach shoppers who match your ideal customer profile
                      </p>
                    </div>

                    {/* Budget & Bidding - Money Flow Section */}
                    <div className="p-5 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <Label className="text-lg font-semibold text-green-900">Budget & Bidding</Label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-base">Total Budget ($)</Label>
                          <Input
                            type="number"
                            step="100"
                            value={formData.budget_total}
                            onChange={(e) => setFormData({ ...formData, budget_total: e.target.value })}
                            placeholder="5000"
                            className="h-12 text-lg"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base">Daily Cap ($)</Label>
                          <Input
                            type="number"
                            step="10"
                            value={formData.daily_budget_cap}
                            onChange={(e) => setFormData({ ...formData, daily_budget_cap: e.target.value })}
                            placeholder="200"
                            className="h-12 text-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base">Bid Type</Label>
                          <Select
                            value={formData.bid_type}
                            onValueChange={(value: "cpm" | "cpc" | "cpa") => setFormData({ ...formData, bid_type: value })}
                          >
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpm" className="text-base py-3">CPM (per 1,000 views)</SelectItem>
                              <SelectItem value="cpc" className="text-base py-3">CPC (per click)</SelectItem>
                              <SelectItem value="cpa" className="text-base py-3">CPA (per redemption)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-base">Bid Amount ($)</Label>
                          <Input
                            type="number"
                            step="0.50"
                            value={formData.bid_amount}
                            onChange={(e) => setFormData({ ...formData, bid_amount: e.target.value })}
                            placeholder={formData.bid_type === 'cpm' ? '10.00' : '0.50'}
                            className="h-12 text-lg"
                            required
                          />
                          <p className="text-sm text-green-600">
                            Suggested: ${formData.bid_type === 'cpm' ? '8-15' : formData.bid_type === 'cpa' ? '1-3' : '0.25-0.75'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-2">
                      <Label className="text-base">Coupon Value ($)</Label>
                      <Input
                        type="number"
                        step="0.25"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        placeholder="2.00"
                        className="h-12 text-lg"
                        required
                      />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-base">Start Date</Label>
                        <Input
                          type="datetime-local"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base">End Date</Label>
                        <Input
                          type="datetime-local"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="h-12 text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-14 px-6 text-lg">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading} className="h-14 px-8 text-lg flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                        {loading ? "Creating..." : "Launch Campaign"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel - 1/3 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl">Campaign Preview</CardTitle>
                  <CardDescription>Estimated performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Estimated Metrics */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <Users className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Est. Impressions</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {estimatedImpressions > 0 ? estimatedImpressions.toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <Target className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Est. Unique Reach</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {estimatedReach > 0 ? estimatedReach.toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl money-flow-card">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Est. Conversions</p>
                        <p className="text-2xl font-bold text-green-600">
                          {estimatedConversions > 0 ? estimatedConversions.toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Money Flow Visual */}
                  <div className="p-4 bg-gray-900 text-white rounded-xl">
                    <p className="text-sm text-gray-400 mb-3">💰 Where Your Money Goes</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Platform Fee</span>
                        <span className="text-cyan-400">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retailer Revenue Share</span>
                        <span className="text-purple-400">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Savings</span>
                        <span className="text-green-400">50%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </BrandDashboardLayout>
  );
};

export default CreateCampaign;
