import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Package, PlusCircle, Target, Home, LogOut, DollarSign, ChefHat, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import BrandDashboardLayout from "@/components/BrandDashboardLayout";
import DemoDataBanner from "@/components/DemoDataBanner";

// Demo mock data for investor presentation
const DEMO_CAMPAIGNS = [
  {
    id: "demo-camp-1",
    name: "Summer Organic Push",
    status: "active",
    impressions_delivered: 45230,
    clicks_delivered: 2847,
    conversions_delivered: 892,
    budget_spent: 2450,
    budget_total: 5000,
    target_segments: ["Health Conscious", "Organic Buyers"],
    revenue: 12847,
    roas: 5.2
  },
  {
    id: "demo-camp-2",
    name: "Dairy Aisle Conquest",
    status: "active",
    impressions_delivered: 28940,
    clicks_delivered: 1562,
    conversions_delivered: 487,
    budget_spent: 1200,
    budget_total: 3000,
    target_segments: ["Competitor Brand Buyers"],
    revenue: 6240,
    roas: 5.2
  },
  {
    id: "demo-camp-3",
    name: "Weekend Family Bundle",
    status: "active",
    impressions_delivered: 12450,
    clicks_delivered: 945,
    conversions_delivered: 312,
    budget_spent: 800,
    budget_total: 2000,
    target_segments: ["Family Households"],
    revenue: 4680,
    roas: 5.85
  }
];

const DEMO_STATS = {
  activeCampaigns: 3,
  totalImpressions: 86620,
  avgROAS: 5.4,
  totalSpent: 4450,
  totalRevenue: 23767
};

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
  revenue?: number;
  roas?: number;
}

const BrandDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    // Merge locally-saved campaign drafts (from Create Campaign) with demo data.
    // Drafts are real user input; the rest is illustrative demo data.
    try {
      const drafts: Campaign[] = JSON.parse(localStorage.getItem("ppop_campaign_drafts") || "[]");
      return [...drafts, ...DEMO_CAMPAIGNS];
    } catch {
      return DEMO_CAMPAIGNS;
    }
  });
  const [stats, setStats] = useState(DEMO_STATS);
  const [loading, setLoading] = useState(false);
  const [brandId, setBrandId] = useState<string | null>('dev-brand-001');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // 🔓 DEMO MODE: Pre-loaded with mock data
    console.log('🔓 DEMO MODE: Brand Dashboard loaded with mock data');
  }, []);

  const calculateCampaignROAS = (campaign: Campaign) => {
    return campaign.roas ? campaign.roas.toFixed(1) + "x" : "0.0x";
  };

  return (
    <BrandDashboardLayout>
      <div className="p-6 tablet-padding">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-purple-500" />
              <h1 className="demo-heading text-gray-900">Campaign Overview</h1>
            </div>
            <p className="text-lg text-gray-600">Horizon Organic • Brand Dashboard</p>
          </div>
          <Link to="/brand-dashboard/create-campaign">
            <Button className="h-14 px-6 text-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <PlusCircle className="w-5 h-5 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>

        <DemoDataBanner className="mb-8" />

        {/* Money Flow Summary - Clear for Investors */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Your Investment Performance
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-purple-200 mb-1">Total Spent</p>
              <p className="text-4xl font-bold">${stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-purple-200 mb-1">Performance Multiplier</p>
              <p className="text-4xl font-bold text-cyan-400">{stats.avgROAS.toFixed(1)}x ROAS</p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 mb-1">Revenue Generated</p>
              <p className="text-4xl font-bold text-green-400">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-center items-center gap-4 text-sm">
            <span className="text-purple-200">Your Ad Spend</span>
            <ArrowRight className="w-5 h-5 text-cyan-400" />
            <span className="text-purple-200">Precision POP Platform</span>
            <ArrowRight className="w-5 h-5 text-cyan-400" />
            <span className="text-purple-200">Retailer Revenue Share</span>
            <ArrowRight className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">Customer Purchases</span>
          </div>
        </div>
        
        {/* Stats Cards - Large for TV */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <p className="demo-stat-label text-gray-600">Active Campaigns</p>
            </div>
            <p className="demo-stat-value text-gray-900">{stats.activeCampaigns}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <p className="demo-stat-label text-gray-600">Impressions</p>
            </div>
            <p className="demo-stat-value text-gray-900">{stats.totalImpressions.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg money-flow-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              <p className="demo-stat-label text-gray-600">Combined ROAS</p>
            </div>
            <p className="demo-stat-value text-cyan-600">{stats.avgROAS.toFixed(1)}x</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg money-flow-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="demo-stat-label text-gray-600">Net Return</p>
            </div>
            <p className="demo-stat-value text-green-600">+${(stats.totalRevenue - stats.totalSpent).toLocaleString()}</p>
          </div>
        </div>

        {/* Campaign List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
            <Link to="/brand-dashboard/segments">
              <Button variant="outline" className="h-12 px-5 text-base">
                <Target className="w-5 h-5 mr-2" />
                Browse Segments
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const ctr = campaign.impressions_delivered > 0 
                ? ((campaign.clicks_delivered / campaign.impressions_delivered) * 100).toFixed(1)
                : "0.0";
              const spendPercent = ((campaign.budget_spent / campaign.budget_total) * 100).toFixed(0);
              
              return (
                <div 
                  key={campaign.id} 
                  className="border-2 border-gray-100 rounded-xl p-5 cursor-pointer hover:border-purple-200 hover:bg-purple-50/30 transition-all"
                  onClick={() => navigate(`/brand-dashboard/campaign/${campaign.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Target className="w-4 h-4 text-purple-500" />
                        <p className="text-base text-gray-600">
                          {campaign.target_segments?.join(", ") || "All Segments"}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-base font-semibold">
                      Active
                    </span>
                  </div>

                  {/* Budget Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Budget Used</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${campaign.budget_spent.toLocaleString()} / ${campaign.budget_total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500" 
                        style={{ width: `${spendPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics Grid - Large for TV */}
                  <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Impressions</p>
                      <p className="text-xl font-bold text-gray-900">{campaign.impressions_delivered.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">CTR</p>
                      <p className="text-xl font-bold text-gray-900">{ctr}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Conversions</p>
                      <p className="text-xl font-bold text-gray-900">{campaign.conversions_delivered}</p>
                    </div>
                    <div className="money-flow-card rounded-lg bg-cyan-50 p-2 -m-2">
                      <p className="text-sm text-gray-500 mb-1">ROAS</p>
                      <p className="text-xl font-bold text-cyan-600">{calculateCampaignROAS(campaign)}</p>
                    </div>
                    <div className="money-flow-card rounded-lg bg-green-50 p-2 -m-2">
                      <p className="text-sm text-gray-500 mb-1">Revenue</p>
                      <p className="text-xl font-bold text-green-600">${campaign.revenue?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BrandDashboardLayout>
  );
};

export default BrandDashboard;
