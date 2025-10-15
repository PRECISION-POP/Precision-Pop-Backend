import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Package, PlusCircle, Target, Home, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
}

const BrandDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalImpressions: 0,
    avgROAS: 0,
  });
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (brandId) {
      fetchCampaigns();
    }
  }, [brandId]);

  const checkAuth = async () => {
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

  const fetchCampaigns = async () => {
    if (!brandId) return;

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } else {
      setCampaigns(data || []);
      
      // Fetch actual redemption revenue
      const campaignIds = data?.map(c => c.id) || [];
      const { data: redemptions } = await supabase
        .from("offer_redemptions")
        .select("basket_total, campaign_id")
        .in("campaign_id", campaignIds);

      const totalRevenue = redemptions?.reduce((sum, r) => sum + (Number(r.basket_total) || 0), 0) || 0;
      
      const active = data?.filter(c => c.status === "active").length || 0;
      const impressions = data?.reduce((sum, c) => sum + (c.impressions_delivered || 0), 0) || 0;
      const spent = data?.reduce((sum, c) => sum + (Number(c.budget_spent) || 0), 0) || 0;
      const roas = spent > 0 ? totalRevenue / spent : 0;

      setStats({
        activeCampaigns: active,
        totalImpressions: impressions,
        avgROAS: roas,
      });
    }
    
    setLoading(false);
  };

  const calculateCampaignROAS = (campaign: Campaign) => {
    const spent = Number(campaign.budget_spent) || 0;
    if (spent === 0) return "0.0";
    // This will be calculated per campaign when we fetch redemptions
    // For now, showing a placeholder that will be enhanced
    return "N/A";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Precision POP</h1>
          <p className="text-sm text-gray-400">Brand Dashboard</p>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </a>
          <Link to="/brand-dashboard/segments" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Target className="w-5 h-5" />
            Browse Segments
          </Link>
          <Link to="/brand-dashboard/create-campaign" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <PlusCircle className="w-5 h-5" />
            Create Campaign
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Package className="w-5 h-5" />
            Analytics
          </a>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Home className="w-5 h-5" />
            Home
          </Link>
        </nav>
        <div className="mt-auto pt-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-8">Campaign Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Active Campaigns</p>
            <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Total Impressions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalImpressions.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Combined ROAS</p>
            <p className="text-3xl font-bold text-primary">{stats.avgROAS.toFixed(1)}x</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Campaigns</h2>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No campaigns yet</p>
              <Button onClick={() => navigate("/brand-dashboard/create-campaign")}>
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const ctr = campaign.impressions_delivered > 0 
                  ? ((campaign.clicks_delivered / campaign.impressions_delivered) * 100).toFixed(1)
                  : "0.0";
                const conversionRate = campaign.clicks_delivered > 0
                  ? ((campaign.conversions_delivered / campaign.clicks_delivered) * 100).toFixed(1)
                  : "0.0";
                
                return (
                  <div 
                    key={campaign.id} 
                    className="border-b pb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors"
                    onClick={() => navigate(`/brand-dashboard/campaign/${campaign.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">
                          {campaign.target_segments?.join(", ") || "All Segments"}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        campaign.status === "active" 
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "draft"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Impressions</p>
                        <p className="font-semibold">{campaign.impressions_delivered.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Clicks (CTR)</p>
                        <p className="font-semibold">{campaign.clicks_delivered} ({ctr}%)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Conversions</p>
                        <p className="font-semibold">{campaign.conversions_delivered}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ROAS</p>
                        <p className="font-semibold text-primary">{calculateCampaignROAS(campaign)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Spent / Budget</p>
                        <p className="font-semibold">${Number(campaign.budget_spent).toFixed(0)} / ${Number(campaign.budget_total).toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
