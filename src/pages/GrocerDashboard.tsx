import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Zap, DollarSign, Home, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GrocerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retailerId, setRetailerId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("Loading...");
  const [flashPromos, setFlashPromos] = useState<any[]>([]);
  const [brandCampaigns, setBrandCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayCheckIns: 0,
    activePromos: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (retailerId) {
      fetchDashboardData();
    }
  }, [retailerId, timeRange]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("retailers")
      .select("id, name")
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
      setStoreName(data.name);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return startOfDay;
    } else if (timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo;
    } else {
      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      return monthAgo;
    }
  };

  const exportToCSV = () => {
    const headers = ['Product', 'SKU', 'Category', 'Discount', 'Stock Remaining', 'Impressions', 'Accepts', 'Redemptions', 'Revenue Impact'];
    const rows = flashPromos.map(promo => [
      promo.product_name,
      promo.sku,
      promo.category,
      `${promo.discount_value}%`,
      promo.stock_remaining,
      promo.impressions_count,
      promo.accept_count,
      promo.redemption_count,
      promo.revenue_impact?.toFixed(2) || '0.00'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flash-promos-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const fetchDashboardData = async () => {
    const startDate = getStartDate();
    
    // Fetch check-ins for selected time range
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("id")
      .eq("retailer_id", retailerId)
      .gte("check_in_time", startDate.toISOString());

    // Fetch active flash promos with metrics
    const { data: promos } = await supabase
      .from("flash_promos")
      .select("*")
      .eq("retailer_id", retailerId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Fetch redemptions for selected time range for revenue calculation
    const { data: todayRedemptions } = await supabase
      .from("offer_redemptions")
      .select("revenue_impact")
      .eq("retailer_id", retailerId)
      .gte("redeemed_at", startDate.toISOString());

    const revenue = todayRedemptions?.reduce((sum, r) => 
      sum + (r.revenue_impact || 0), 0) || 0;

    // Fetch active brand campaigns for retail media revenue
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select(`
        *,
        brands(name)
      `)
      .eq("status", "active")
      .order("bid_amount", { ascending: false })
      .limit(3);

    const todayCheckInCount = checkIns?.length || 0;
    const campaignsWithRevenue = campaigns?.map((c: any) => ({
      ...c,
      brandName: c.brands?.name || "Unknown Brand",
      todayRevenue: c.bid_type === 'cpm' 
        ? (todayCheckInCount * c.bid_amount / 1000)
        : (todayCheckInCount * c.bid_amount)
    })) || [];

    setStats({
      todayCheckIns: todayCheckInCount,
      activePromos: promos?.length || 0,
      todayRevenue: revenue
    });

    setFlashPromos(promos || []);
    setBrandCampaigns(campaignsWithRevenue);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Precision POP</h1>
          <p className="text-sm text-gray-400">Grocer Dashboard</p>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </a>
          <Link to="/grocer-dashboard/flash-promo" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Zap className="w-5 h-5" />
            Create Flash Promo
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <DollarSign className="w-5 h-5" />
            Revenue
          </a>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Home className="w-5 h-5" />
            Home
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{storeName}</h1>
            <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
          </div>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Check-ins</p>
            <p className="text-3xl font-bold text-gray-900">{stats.todayCheckIns}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Active Flash Promos</p>
            <p className="text-3xl font-bold text-primary">{stats.activePromos}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Media Revenue</p>
            <p className="text-3xl font-bold text-green-600">${stats.todayRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Active Flash Promotions */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">🚨 Active Flash Promotions</h2>
            <div className="flex gap-3">
              {flashPromos.length > 0 && (
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
              <Link to="/grocer-dashboard/flash-promo" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                + Create New
              </Link>
            </div>
          </div>
          
          {flashPromos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No active flash promos</p>
              <Button onClick={() => navigate("/grocer-dashboard/flash-promo")}>
                Create Your First Promo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {flashPromos.map((promo) => {
                const impressions = promo.impressions_count || 0;
                const accepts = promo.accept_count || 0;
                const redemptions = promo.redemption_count || 0;
                const acceptRate = impressions > 0 ? ((accepts / impressions) * 100).toFixed(0) : "0";
                const stockMoved = promo.stock_initial - promo.stock_remaining;
                const stockPercent = promo.stock_initial > 0
                  ? ((stockMoved / promo.stock_initial) * 100).toFixed(0)
                  : "0";

                return (
                  <div key={promo.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{promo.product_name} - {promo.discount_value}% off</h3>
                          {promo.category === 'Private Label' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              🏪 Store Brand
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(promo.created_at).toLocaleTimeString()} | 
                          SKU: {promo.sku} | 
                          Category: {promo.category}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
                        {promo.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">📦 Inventory Status:</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${stockPercent}%` }}></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{promo.stock_remaining} / {promo.stock_initial} units</p>
                          <p className="text-xs text-gray-600">{stockPercent}% moved</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Impressions</p>
                        <p className="font-semibold">{impressions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Accepts</p>
                        <p className="font-semibold text-green-600">{accepts} ({acceptRate}%)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Redemptions</p>
                        <p className="font-semibold">{redemptions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Revenue Impact</p>
                        <p className="font-semibold text-primary">${(promo.revenue_impact || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Retail Media Revenue */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-6">💰 Retail Media Revenue</h2>
          {brandCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No brand campaigns running</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {brandCampaigns.map((campaign, index) => (
                  <div key={campaign.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{campaign.brandName} - "{campaign.name}"</p>
                      <p className="text-sm text-gray-600">
                        Position #{index + 1} • {stats.todayCheckIns} check-ins × $
                        {campaign.bid_type === 'cpm' 
                          ? (campaign.bid_amount / 1000).toFixed(2)
                          : campaign.bid_amount.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">${campaign.todayRevenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t flex justify-between items-center">
                <p className="text-lg font-semibold">Monthly Projection</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(brandCampaigns.reduce((sum, c) => sum + c.todayRevenue, 0) * 30).toFixed(0)}
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default GrocerDashboard;
