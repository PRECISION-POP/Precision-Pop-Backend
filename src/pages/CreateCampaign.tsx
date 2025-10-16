import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [brandId, setBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);

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
    fetchBrandId();
    fetchSegments();
  }, []);

  const fetchBrandId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("brands")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Brand account not found",
        variant: "destructive",
      });
      navigate("/auth");
    } else {
      setBrandId(data.id);
    }
  };

  const fetchSegments = async () => {
    const { data } = await supabase
      .from("customer_segments")
      .select("name")
      .order("customer_count", { ascending: false });
    
    setAvailableSegments(data?.map(s => s.name) || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `campaign-creatives/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('campaign-assets')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    } else {
      const { data } = supabase.storage.from('campaign-assets').getPublicUrl(filePath);
      setFormData({ ...formData, creative_url: data.publicUrl });
      toast({ title: "Success", description: "Image uploaded successfully" });
    }

    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) return;

    // Validate date range
    if (formData.end_date <= formData.start_date) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // STEP 1: Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert([{
        brand_id: brandId,
        name: formData.name,
        budget_total: parseFloat(formData.budget_total),
        bid_amount: parseFloat(formData.bid_amount),
        bid_type: formData.bid_type,
        target_segments: formData.target_segments,
        discount_value: parseFloat(formData.discount_value),
        start_date: formData.start_date,
        end_date: formData.end_date,
        creative_url: formData.creative_url,
        daily_budget_cap: formData.daily_budget_cap ? parseFloat(formData.daily_budget_cap) : null,
        status: "draft",
      }])
      .select()
      .single();

    if (campaignError) {
      toast({
        title: "Error",
        description: campaignError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // STEP 2: Create the actual offer that shoppers will see
    const { error: offerError } = await supabase
      .from("offers")
      .insert([{
        campaign_id: campaign.id,
        type: "campaign",
        product_name: formData.product_name,
        sku: formData.sku,
        discount_value: parseFloat(formData.discount_value),
        image_url: formData.creative_url,
        valid_until: formData.end_date,
      }]);

    if (offerError) {
      // Rollback campaign if offer creation fails
      await supabase.from("campaigns").delete().eq("id", campaign.id);
      toast({
        title: "Error",
        description: "Failed to create offer: " + offerError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Campaign and offer created successfully",
    });
    navigate("/brand-dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Spring Sale - Organic Milk"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="e.g., Organic Whole Milk"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Product Code</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., MILK-ORG-001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_total">Total Budget ($)</Label>
                  <Input
                    id="budget_total"
                    type="number"
                    step="0.01"
                    value={formData.budget_total}
                    onChange={(e) => setFormData({ ...formData, budget_total: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_budget_cap">Daily Budget Cap ($)</Label>
                  <Input
                    id="daily_budget_cap"
                    type="number"
                    step="0.01"
                    value={formData.daily_budget_cap}
                    onChange={(e) => setFormData({ ...formData, daily_budget_cap: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bid_type">Bid Type</Label>
                  <Select
                    value={formData.bid_type}
                    onValueChange={(value: "cpm" | "cpc" | "cpa") => setFormData({ ...formData, bid_type: value })}
                  >
                    <SelectTrigger id="bid_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpm">CPM (Cost Per 1,000 Impressions)</SelectItem>
                      <SelectItem value="cpc">CPC (Cost Per Click/Accept)</SelectItem>
                      <SelectItem value="cpa">CPA (Cost Per Redemption)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid_amount">Bid Amount ($)</Label>
                  <Input
                    id="bid_amount"
                    type="number"
                    step="0.01"
                    value={formData.bid_amount}
                    onChange={(e) => setFormData({ ...formData, bid_amount: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Suggested: ${formData.bid_type === 'cpm' ? '5-15' : formData.bid_type === 'cpa' ? '1-3' : '0.25-0.75'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Customer Segments</Label>
                <Select
                  value={formData.target_segments[0] || ""}
                  onValueChange={(value) => 
                    setFormData({ ...formData, target_segments: [value] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSegments.map(segment => (
                      <SelectItem key={segment} value={segment}>
                        {segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Or <Button variant="link" className="h-auto p-0" onClick={() => navigate("/brand-dashboard/segments")}>
                    browse all segments
                  </Button>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">Discount Value ($)</Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creative">Creative Asset (Image/Video)</Label>
                <Input
                  id="creative"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                {formData.creative_url && (
                  <div className="mt-2">
                    <img src={formData.creative_url} alt="Preview" className="max-w-xs rounded border" />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !brandId}>
                  {loading ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCampaign;
