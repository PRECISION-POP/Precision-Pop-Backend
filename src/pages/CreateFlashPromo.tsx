import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Zap, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateFlashPromo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retailerId, setRetailerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    product_name: "",
    sku: "",
    category: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    regular_price: "",
    stock_initial: "",
    auto_disable_at_zero: true,
    target_segments: [] as string[],
    show_to_all: true,
    start_immediately: true,
    start_time: "",
    end_time: "",
    priority: "normal" as "normal" | "high",
  });

  useEffect(() => {
    checkAuth();
    fetchSegments();
    
    // Set default end time to end of day
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 0, 0);
    setFormData(prev => ({
      ...prev,
      end_time: endOfDay.toISOString().slice(0, 16)
    }));
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("retailers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Retailer account not found",
        variant: "destructive",
      });
      navigate("/auth");
    } else {
      setRetailerId(data.id);
    }
  };

  const fetchSegments = async () => {
    const { data } = await supabase
      .from("customer_segments")
      .select("name")
      .order("customer_count", { ascending: false });
    
    setAvailableSegments(data?.map(s => s.name) || []);
  };

  const calculateDiscountedPrice = () => {
    const regularPrice = parseFloat(formData.regular_price) || 0;
    const discountValue = parseFloat(formData.discount_value) || 0;
    
    if (formData.discount_type === "percentage") {
      return regularPrice * (1 - discountValue / 100);
    } else {
      return regularPrice - discountValue;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerId) return;

    // Validation
    if (parseFloat(formData.stock_initial) <= 0) {
      toast({
        title: "Error",
        description: "Initial stock must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (calculateDiscountedPrice() <= 0) {
      toast({
        title: "Error",
        description: "Discounted price must be positive",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const now = new Date().toISOString();
    const startTime = formData.start_immediately ? now : formData.start_time;

    const { data, error } = await supabase
      .from("flash_promos")
      .insert([{
        retailer_id: retailerId,
        created_by: retailerId,
        product_name: formData.product_name,
        sku: formData.sku,
        category: formData.category,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        regular_price: parseFloat(formData.regular_price),
        discounted_price: calculateDiscountedPrice(),
        stock_initial: parseInt(formData.stock_initial),
        stock_remaining: parseInt(formData.stock_initial),
        auto_disable_at_zero: formData.auto_disable_at_zero,
        target_segments: formData.show_to_all ? null : formData.target_segments,
        show_to_all: formData.show_to_all,
        priority: formData.priority,
        start_time: startTime,
        end_time: formData.end_time,
        status: "active",
        type: "retailerFlash"
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Also create an offer entry so it shows in swipe interface
      await supabase.from("offers").insert([{
        type: "flash",
        flash_promo_id: data.id,
        product_name: formData.product_name,
        sku: formData.sku,
        discount_value: parseFloat(formData.discount_value),
        valid_until: formData.end_time,
        image_url: null,
      }]);

      toast({
        title: "Success",
        description: `Flash promo created and active! ${formData.stock_initial} units available.`,
      });
      navigate("/grocer-dashboard");
    }

    setLoading(false);
  };

  const discountedPrice = calculateDiscountedPrice();
  const savingsPercent = formData.regular_price 
    ? ((parseFloat(formData.regular_price) - discountedPrice) / parseFloat(formData.regular_price) * 100)
    : 0;
  const savingsPercentDisplay = savingsPercent.toFixed(0);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              Create Flash Promo
            </h1>
            <p className="text-muted-foreground">Launch instant promotions to move inventory fast</p>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Flash promos appear immediately to shoppers in your store. Perfect for clearing perishables or excess inventory.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Promo Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Product Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product_name">Product Name</Label>
                      <Input
                        id="product_name"
                        value={formData.product_name}
                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                        placeholder="e.g., Organic Greek Yogurt"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g., YOG-ORG-001"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dairy">Dairy</SelectItem>
                            <SelectItem value="Produce">Produce</SelectItem>
                            <SelectItem value="Meat">Meat</SelectItem>
                            <SelectItem value="Bakery">Bakery</SelectItem>
                            <SelectItem value="Deli">Deli</SelectItem>
                            <SelectItem value="Private Label">Private Label</SelectItem>
                            <SelectItem value="Frozen">Frozen</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Pricing</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="regular_price">Regular Price ($)</Label>
                        <Input
                          id="regular_price"
                          type="number"
                          step="0.01"
                          value={formData.regular_price}
                          onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                          placeholder="4.99"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount_type">Discount Type</Label>
                        <Select
                          value={formData.discount_type}
                          onValueChange={(value: "percentage" | "fixed") => 
                            setFormData({ ...formData, discount_type: value })
                          }
                        >
                          <SelectTrigger id="discount_type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage Off (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount_value">
                        Discount Value ({formData.discount_type === "percentage" ? "%" : "$"})
                      </Label>
                      <Input
                        id="discount_value"
                        type="number"
                        step={formData.discount_type === "percentage" ? "1" : "0.01"}
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        placeholder={formData.discount_type === "percentage" ? "30" : "1.50"}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Common: 20%, 30%, 50% off or $0.50, $1.00, $2.00 off
                      </p>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Inventory</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stock_initial">Units Available</Label>
                      <Input
                        id="stock_initial"
                        type="number"
                        value={formData.stock_initial}
                        onChange={(e) => setFormData({ ...formData, stock_initial: e.target.value })}
                        placeholder="100"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Disable When Sold Out</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically end promo when inventory reaches zero
                        </p>
                      </div>
                      <Switch
                        checked={formData.auto_disable_at_zero}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, auto_disable_at_zero: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Targeting */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Targeting (Optional)</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show to All Shoppers</Label>
                        <p className="text-sm text-muted-foreground">
                          Recommended for maximum impact
                        </p>
                      </div>
                      <Switch
                        checked={formData.show_to_all}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, show_to_all: checked })
                        }
                      />
                    </div>

                    {!formData.show_to_all && (
                      <div className="space-y-2">
                        <Label>Target Segments</Label>
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
                      </div>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Timing</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Start Immediately</Label>
                        <p className="text-sm text-muted-foreground">
                          Launch promo right now
                        </p>
                      </div>
                      <Switch
                        checked={formData.start_immediately}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, start_immediately: checked })
                        }
                      />
                    </div>

                    {!formData.start_immediately && (
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          required={!formData.start_immediately}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Recommended: End of day (11:59 PM) for flash promos
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: "normal" | "high") => 
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (Standard Position)</SelectItem>
                          <SelectItem value="high">High (Top of Feed)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !retailerId} className="flex-1">
                      <Zap className="w-4 h-4 mr-2" />
                      {loading ? "Creating..." : formData.start_immediately ? "Launch Now" : "Schedule Promo"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview - 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Shopper Preview</CardTitle>
                <CardDescription>How this will appear in-app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 space-y-3">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">🏷️</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">
                      {formData.product_name || "Product Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.category || "Category"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      {formData.regular_price && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${parseFloat(formData.regular_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {savingsPercent > 0 && (
                      <div className="inline-block px-2 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                        Save {savingsPercentDisplay}%
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      {formData.stock_initial ? `${formData.stock_initial} available` : "Stock TBD"} • 
                      Expires {formData.end_time ? new Date(formData.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "today"}
                    </p>
                  </div>
                </div>

                {formData.start_immediately && (
                  <Alert className="mt-4">
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Will appear to shoppers <strong>immediately</strong> after creation
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFlashPromo;
