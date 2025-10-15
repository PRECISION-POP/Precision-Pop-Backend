import { Link } from "react-router-dom";
import { BarChart3, Zap, DollarSign, Home } from "lucide-react";

const GrocerDashboard = () => {
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
        <h1 className="text-3xl font-bold mb-2">Kroger Downtown</h1>
        <p className="text-gray-600 mb-8">Wednesday, October 7, 2025 - {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Today's Check-ins</p>
            <p className="text-3xl font-bold text-gray-900">280</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Active Flash Promos</p>
            <p className="text-3xl font-bold text-primary">1</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Media Revenue (Today)</p>
            <p className="text-3xl font-bold text-green-600">$73.50</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-600 mb-2">Customer Satisfaction</p>
            <p className="text-3xl font-bold text-yellow-500">4.8⭐</p>
          </div>
        </div>

        {/* Active Flash Promotions */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">🚨 Active Flash Promotions (Today)</h2>
            <Link to="/grocer-dashboard/flash-promo" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              + Create New
            </Link>
          </div>
          
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Organic Yogurt - 30% off</h3>
                <p className="text-sm text-gray-600">Created: 9:00 AM | SKU: 67890 | Category: Dairy</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">📦 Inventory Status:</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '47%' }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">53 / 100 units</p>
                  <p className="text-xs text-gray-600">47% moved</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Impressions</p>
                <p className="font-semibold">87</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Accepts</p>
                <p className="font-semibold text-green-600">61 (70%)</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Redemptions</p>
                <p className="font-semibold">28</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Revenue Impact</p>
                <p className="font-semibold text-primary">$97.72</p>
              </div>
            </div>
          </div>
        </div>

        {/* Retail Media Revenue */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-6">💰 Retail Media Revenue (Today)</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Coke - "Buy 2 Save $3"</p>
                <p className="text-sm text-gray-600">Position #1 • 280 check-ins × $0.75</p>
              </div>
              <p className="text-lg font-bold text-green-600">$31.50</p>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Pepsi - "2L Bottles $0.99"</p>
                <p className="text-sm text-gray-600">Position #2 • 280 check-ins × $0.50</p>
              </div>
              <p className="text-lg font-bold text-green-600">$21.00</p>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Frito-Lay - "Family Size $1 Off"</p>
                <p className="text-sm text-gray-600">Position #3 • 280 check-ins × $0.50</p>
              </div>
              <p className="text-lg font-bold text-green-600">$21.00</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t flex justify-between items-center">
            <p className="text-lg font-semibold">Monthly Projection</p>
            <p className="text-2xl font-bold text-green-600">$2,205</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GrocerDashboard;
