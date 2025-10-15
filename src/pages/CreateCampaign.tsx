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

  const [formData, setFormData] = useState({
    name: "",
    budget_total: "",
    bid_amount: "",
    bid_type: "cpm" as "cpm" | "cpc",
    target_segments: location.state?.targetSegment ? [location.state.targetSegment] : [],
    discount_value: "",
    start_date: "",
    end_date: "",
    creative_url: "",
    daily_budget_cap: "",
  });

  useEffect(() => {
    fetchBrandId();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) return;

    setLoading(true);

    const { error } = await supabase.from("campaigns").insert({
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
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      navigate("/brand-dashboard");
    }

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
                  required
                />
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
                    onValueChange={(value: "cpm" | "cpc") => setFormData({ ...formData, bid_type: value })}
                  >
                    <SelectTrigger id="bid_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpm">CPM (Cost Per Mille)</SelectItem>
                      <SelectItem value="cpc">CPC (Cost Per Click)</SelectItem>
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
                </div>
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
                <Label htmlFor="creative_url">Creative URL (Image/Video)</Label>
                <Input
                  id="creative_url"
                  type="url"
                  value={formData.creative_url}
                  onChange={(e) => setFormData({ ...formData, creative_url: e.target.value })}
                  placeholder="https://..."
                />
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
