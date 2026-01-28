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
      {/* Sidebar - Optimized for tablet */}
      <aside className="w-64 tablet-sidebar bg-gray-900 text-white p-6 flex flex-col flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Precision POP</h1>
          <p className="text-sm text-gray-400">Brand Dashboard</p>
        </div>
        <nav className="space-y-2 flex-1">
          <Link 
            to="/brand-dashboard" 
            className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-colors min-h-[56px] ${
              isActive("/brand-dashboard") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-lg font-medium">Dashboard</span>
          </Link>
          
          <Link 
            to="/brand-dashboard/digital-slotting" 
            className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-colors min-h-[56px] ${
              isActive("/brand-dashboard/digital-slotting") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <DollarSign className="w-6 h-6" />
            <span className="text-lg">Digital Slotting</span>
          </Link>
          
          <Link 
            to="/brand-dashboard/recipe-bidding" 
            className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-colors min-h-[56px] ${
              isActive("/brand-dashboard/recipe-bidding") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <ChefHat className="w-6 h-6" />
            <span className="text-lg">Recipe Bidding</span>
          </Link>
          
          <Link 
            to="/brand-dashboard/segments" 
            className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-colors min-h-[56px] ${
              isActive("/brand-dashboard/segments") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <Target className="w-6 h-6" />
            <span className="text-lg">Browse Segments</span>
          </Link>
          
          <Link 
            to="/brand-dashboard/create-campaign" 
            className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-colors min-h-[56px] ${
              isActive("/brand-dashboard/create-campaign") 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-gray-800"
            }`}
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-lg">Create Campaign</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-3 px-4 py-4 rounded-lg hover:bg-gray-800 transition-colors min-h-[56px]">
            <Home className="w-6 h-6" />
            <span className="text-lg">Home</span>
          </Link>
        </nav>
        <div className="pt-6 border-t border-gray-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-gray-800 h-14 text-lg"
            onClick={handleSignOut}
          >
            <LogOut className="w-6 h-6 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default BrandDashboardLayout;
