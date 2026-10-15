import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Zap, DollarSign, Home, Download, Gift, TrendingUp, Store, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DemoDataBanner from "@/components/DemoDataBanner";

// Demo mock data for investor presentation
const DEMO_DATA = {
  storeName: "HEB Mueller",
  stats: {
    todayCheckIns: 847,
    activePromos: 12,
    todayRevenue: 2847.50,
    brandRevenue: 1250.00
  },
  flashPromos: [
    {
      id: "demo-1",
      product_name: "Organic Greek Yogurt",
      sku: "YOG-ORG-001",
      category: "Dairy",
      discount_value: 30,
      stock_initial: 200,
      stock_remaining: 47,
      impressions_count: 1250,
      accept_count: 412,
      redemption_count: 187,
      revenue_impact: 842.50,
      status: "active",
      created_at: new Date().toISOString()
    },
    {
      id: "demo-2",
      product_name: "HEB Store Brand Milk",
      sku: "MLK-HEB-GAL",
      category: "Private Label",
      discount_value: 25,
      stock_initial: 150,
      stock_remaining: 28,
      impressions_count: 890,
      accept_count: 356,
      redemption_count: 122,
      revenue_impact: 427.00,
      status: "active",
      created_at: new Date().toISOString()
    }
  ],
  brandCampaigns: [
    { id: "bc-1", brandName: "Horizon Organic", name: "Spring Dairy Push", todayRevenue: 450.00, checkIns: 847, cpmRate: 12.50 },
    { id: "bc-2", brandName: "Chobani", name: "Yogurt Launch", todayRevenue: 380.00, checkIns: 847, cpmRate: 10.00 },
    { id: "bc-3", brandName: "Oatly", name: "Plant-Based Awareness", todayRevenue: 420.00, checkIns: 847, cpmRate: 11.00 }
  ]
};

const GrocerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retailerId, setRetailerId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState(DEMO_DATA.storeName);
  const [flashPromos, setFlashPromos] = useState<any[]>(DEMO_DATA.flashPromos);
  const [brandCampaigns, setBrandCampaigns] = useState<any[]>(DEMO_DATA.brandCampaigns);
  const [stats, setStats] = useState(DEMO_DATA.stats);
  const [couponBiddingRevenue, setCouponBiddingRevenue] = useState(DEMO_DATA.stats.brandRevenue);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    // 🔓 GOD MODE: Use demo data for presentation
    setRetailerId('dev-retailer-001');
    console.log('🔓 DEMO MODE: Grocer Dashboard loaded with mock data');
  }, []);

  const exportToCSV = () => {
    // Export the on-screen demo figures as a real CSV download.
    try {
      const rows: string[][] = [
        ["metric", "value"],
        ["store", storeName],
        ["time_range", timeRange],
        ["check_ins", String(stats.todayCheckIns)],
        ["active_promos", String(stats.activePromos)],
        ["today_revenue", String(stats.todayRevenue)],
        ["brand_revenue", String(stats.brandRevenue)],
        [],
        ["promo_id", "product", "sku", "category", "discount_pct", "stock_remaining", "impressions", "accepts", "redemptions", "revenue_impact", "status"],
        ...flashPromos.map((p: any) => [
          p.id, p.product_name, p.sku, p.category, p.discount_value,
          p.stock_remaining, p.impressions_count, p.accept_count,
          p.redemption_count, p.revenue_impact, p.status,
        ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grocer-report-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete", description: "CSV report downloaded." });
    } catch {
      toast({ title: "Export failed", description: "Could not generate the CSV.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - optimized for tablet */}
      <aside className="w-64 tablet-sidebar bg-gray-900 text-white p-6 flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Precision POP</h1>
          <p className="text-sm text-gray-400">Retailer Dashboard</p>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-4 rounded-lg bg-primary/10 text-primary min-h-[56px]">
            <BarChart3 className="w-6 h-6" />
            <span className="text-lg font-medium">Dashboard</span>
          </a>
          <Link to="/grocer-dashboard/coupons" className="flex items-center gap-3 px-4 py-4 rounded-lg hover:bg-gray-800 transition-colors min-h-[56px]">
            <Gift className="w-6 h-6" />
            <span className="text-lg">Manage Coupons</span>
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-4 rounded-lg hover:bg-gray-800 transition-colors min-h-[56px]">
            <DollarSign className="w-6 h-6" />
            <span className="text-lg">Revenue</span>
          </a>
          <Link to="/" className="flex items-center gap-3 px-4 py-4 rounded-lg hover:bg-gray-800 transition-colors min-h-[56px]">
            <Home className="w-6 h-6" />
            <span className="text-lg">Home</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6 tablet-padding overflow-auto">
        <DemoDataBanner className="mb-6" />
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-8 h-8 text-primary" />
              <h1 className="demo-heading text-gray-900">{storeName}</h1>
            </div>
            <p className="text-lg text-gray-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-44 h-14 text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today" className="text-lg py-3">Today</SelectItem>
              <SelectItem value="week" className="text-lg py-3">Last 7 Days</SelectItem>
              <SelectItem value="month" className="text-lg py-3">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Stats Cards - Large for TV viewing */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <p className="demo-stat-label text-gray-600">Check-ins</p>
            </div>
            <p className="demo-stat-value text-gray-900">{stats.todayCheckIns.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <p className="demo-stat-label text-gray-600">Active Promos</p>
            </div>
            <p className="demo-stat-value text-primary">{stats.activePromos}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg money-flow-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="demo-stat-label text-gray-600">Promo Revenue</p>
            </div>
            <p className="demo-stat-value text-green-600">${stats.todayRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg money-flow-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <p className="demo-stat-label text-gray-600">Brand Media</p>
            </div>
            <p className="demo-stat-value text-emerald-600">${couponBiddingRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">From brand bids</p>
          </div>
        </div>

        {/* Active Flash Promotions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-7 h-7 text-primary" />
              Active Flash Promotions
            </h2>
            <div className="flex gap-3">
              <Button onClick={exportToCSV} variant="outline" className="h-14 px-6 text-lg">
                <Download className="w-5 h-5 mr-2" />
                Export
              </Button>
              <Link to="/grocer-dashboard/coupons">
                <Button className="h-14 px-6 text-lg bg-primary hover:bg-primary/90">
                  + Create Coupon
                </Button>
              </Link>
            </div>
          </div>
          
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
                <div key={promo.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {promo.product_name} — {promo.discount_value}% OFF
                        </h3>
                        {promo.category === 'Private Label' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                            🏪 Store Brand
                          </span>
                        )}
                      </div>
                      <p className="text-base text-gray-600">
                        SKU: {promo.sku} • {promo.category}
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-base font-semibold capitalize">
                      {promo.status}
                    </span>
                  </div>

                  {/* Inventory Progress - High Visibility */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-semibold text-gray-700">📦 Inventory</span>
                      <span className="text-lg font-bold text-gray-900">{promo.stock_remaining} / {promo.stock_initial} units</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500" 
                        style={{ width: `${stockPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 text-right">{stockPercent}% moved</p>
                  </div>

                  {/* Metrics Row - Large for TV */}
                  <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Impressions</p>
                      <p className="text-2xl font-bold text-gray-900">{impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Accepts</p>
                      <p className="text-2xl font-bold text-green-600">{accepts} <span className="text-base font-normal">({acceptRate}%)</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Redemptions</p>
                      <p className="text-2xl font-bold text-gray-900">{redemptions}</p>
                    </div>
                    <div className="money-flow-card rounded-lg bg-green-50 p-3 -m-3">
                      <p className="text-sm text-gray-500 mb-1">Revenue Impact</p>
                      <p className="text-2xl font-bold text-green-600">${(promo.revenue_impact || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retail Media Revenue - Brand Money Flow */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-green-600" />
            Retail Media Revenue
            <span className="ml-2 text-sm font-normal text-gray-500">💰 Where brand money flows</span>
          </h2>
          
          <div className="space-y-4 mb-6">
            {brandCampaigns.map((campaign, index) => (
              <div key={campaign.id} className="flex justify-between items-center p-5 border-2 border-gray-100 rounded-xl hover:border-green-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{campaign.brandName}</p>
                    <p className="text-base text-gray-600">"{campaign.name}"</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {campaign.checkIns} check-ins × ${(campaign.cpmRate / 1000).toFixed(4)} CPM
                    </p>
                  </div>
                </div>
                <div className="text-right money-flow-card rounded-lg bg-green-50 px-5 py-3">
                  <p className="text-sm text-gray-500">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${campaign.todayRevenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Projection - Prominent */}
          <div className="pt-6 border-t-2 border-gray-100">
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div>
                <p className="text-xl font-bold text-gray-900">Monthly Projection</p>
                <p className="text-base text-gray-600">Based on current daily performance</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-green-600">
                  ${(brandCampaigns.reduce((sum, c) => sum + c.todayRevenue, 0) * 30).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">passive brand media income</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GrocerDashboard;
