import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, Store, Sparkles, Zap, TrendingUp, Target } from "lucide-react";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      {/* Gradient orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-cyan-400 animate-glow-pulse" />
            <h1 className="text-7xl font-bold text-gradient-hero">
              Precision POP
            </h1>
            <Zap className="w-12 h-12 text-purple-400 animate-glow-pulse" />
          </div>
          <p className="text-3xl text-foreground/90 italic font-light mb-4">
            "Why check out, when you can check in?"
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The world's first AI-powered in-store engagement platform connecting brands with shoppers in real-time
          </p>
        </div>

        {/* Auth Button */}
        {!isAuthenticated && (
          <div className="mb-16 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 glow-purple transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Enter Platform
            </Button>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full mb-16">
          <Link to="/brand-dashboard" className="group animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card rounded-2xl p-10 transition-all duration-500 hover:scale-[1.02] hover:glow-purple relative overflow-hidden">
              {/* Animated corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full transition-all duration-500 group-hover:scale-150" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-6 transform transition-transform duration-500 group-hover:scale-110">
                  <div className="relative">
                    <Package className="w-20 h-20 text-purple-400" />
                    <div className="absolute inset-0 blur-xl bg-purple-400/50 group-hover:bg-purple-400/70 transition-all duration-500" />
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-foreground mb-4 group-hover:text-gradient-accent transition-all duration-300">
                  Brand Dashboard
                </h2>
                
                <p className="text-lg text-muted-foreground mb-6">
                  Launch targeted campaigns, reach high-value segments, and track real-time performance
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm border border-purple-500/30">
                    <Target className="w-3 h-3" />
                    Precision Targeting
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm border border-cyan-500/30">
                    <TrendingUp className="w-3 h-3" />
                    Real-time Analytics
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/grocer-dashboard" className="group animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="glass-card rounded-2xl p-10 transition-all duration-500 hover:scale-[1.02] hover:glow-cyan relative overflow-hidden">
              {/* Animated corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full transition-all duration-500 group-hover:scale-150" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-6 transform transition-transform duration-500 group-hover:scale-110">
                  <div className="relative">
                    <Store className="w-20 h-20 text-cyan-400" />
                    <div className="absolute inset-0 blur-xl bg-cyan-400/50 group-hover:bg-cyan-400/70 transition-all duration-500" />
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-foreground mb-4 group-hover:text-gradient-accent transition-all duration-300">
                  Grocer Dashboard
                </h2>
                
                <p className="text-lg text-muted-foreground mb-6">
                  Create flash promos, clear inventory instantly, and maximize revenue with AI-powered insights
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm border border-cyan-500/30">
                    <Zap className="w-3 h-3" />
                    Instant Activation
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm border border-purple-500/30">
                    <TrendingUp className="w-3 h-3" />
                    Revenue Optimization
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Status Badge */}
        <div className="glass-card rounded-xl px-8 py-4 border-primary/30 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-foreground flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="font-semibold">Platform Status: Online</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
