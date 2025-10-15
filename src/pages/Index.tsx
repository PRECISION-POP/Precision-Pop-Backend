import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, Store } from "lucide-react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4">Precision POP</h1>
        <p className="text-2xl text-white/90 italic">"Why check out, when you can check in?"</p>
      </div>

      <div className="flex gap-4 mb-8">
        {!isAuthenticated && (
          <Button onClick={() => navigate("/auth")} size="lg">
            Sign In / Sign Up
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl w-full">
        <Link to="/brand-dashboard" className="group">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex justify-center mb-6">
              <Package className="w-20 h-20 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Brand Dashboard</h2>
            <p className="text-lg text-gray-600">
              Create campaigns, target segments, and track performance
            </p>
          </div>
        </Link>

        <Link to="/grocer-dashboard" className="group">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex justify-center mb-6">
              <Store className="w-20 h-20 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Grocer Dashboard</h2>
            <p className="text-lg text-gray-600">
              Manage flash promos, view revenue, and monitor store analytics
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-8 py-4 border border-white/20">
        <p className="text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          Platform Status: Online - {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </p>
      </div>
    </div>
  );
};

export default Index;
