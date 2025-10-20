import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, DollarSign, ChefHat, Target, PlusCircle, Package, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface BrandDashboardLayoutProps {
  children: React.ReactNode;
}

const BrandDashboardLayout = ({ children }: BrandDashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Precision POP</h1>
          <p className="text-sm text-gray-400">Brand Dashboard</p>
        </div>
        <nav className="space-y-2 flex-1">
          <Link 
            to="/brand-dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/brand-dashboard") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link 
            to="/brand-dashboard/digital-slotting" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/brand-dashboard/digital-slotting") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Digital Slotting
          </Link>
          
          <Link 
            to="/brand-dashboard/recipe-bidding" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/brand-dashboard/recipe-bidding") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <ChefHat className="w-5 h-5" />
            Recipe Bidding
          </Link>
          
          <Link 
            to="/brand-dashboard/segments" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/brand-dashboard/segments") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <Target className="w-5 h-5" />
            Browse Segments
          </Link>
          
          <Link 
            to="/brand-dashboard/create-campaign" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/brand-dashboard/create-campaign") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
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
        <div className="pt-6 border-t border-gray-800">
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
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default BrandDashboardLayout;
