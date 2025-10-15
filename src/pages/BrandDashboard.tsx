import { Link } from "react-router-dom";
import { BarChart3, Package, PlusCircle, Target, Home } from "lucide-react";

const BrandDashboard = () => {
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-8">Campaign Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Active Campaigns</p>
            <p className="text-3xl font-bold text-gray-900">2</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Total Impressions</p>
            <p className="text-3xl font-bold text-gray-900">534</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Combined ROAS</p>
            <p className="text-3xl font-bold text-primary">5.5x</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Campaigns</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">Sprite 2L Campaign</h3>
                  <p className="text-sm text-gray-600">Weekly Marketplace • 7UP Loyalists</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-600">Impressions</p>
                  <p className="font-semibold">347</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Accepts</p>
                  <p className="font-semibold">163</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Redemptions</p>
                  <p className="font-semibold">89</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">ROAS</p>
                  <p className="font-semibold text-primary">36.0x</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">Organic Milk Campaign</h3>
                  <p className="text-sm text-gray-600">Weekly Marketplace • Organic Shoppers</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-600">Impressions</p>
                  <p className="font-semibold">892</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Accepts</p>
                  <p className="font-semibold">421</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Redemptions</p>
                  <p className="font-semibold">234</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">ROAS</p>
                  <p className="font-semibold text-primary">24.5x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
