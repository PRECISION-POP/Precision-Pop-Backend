import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BrandDashboard from "./pages/BrandDashboard";
import BrowseSegments from "./pages/BrowseSegments";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import GrocerDashboard from "./pages/GrocerDashboard";
import CouponManager from "./pages/grocer-dashboard/CouponManager";
import DigitalSlotting from "./pages/brand-dashboard/DigitalSlotting";
import RecipeBidding from "./pages/brand-dashboard/RecipeBidding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/brand-dashboard" element={<BrandDashboard />} />
          <Route path="/brand-dashboard/segments" element={<BrowseSegments />} />
          <Route path="/brand-dashboard/create-campaign" element={<CreateCampaign />} />
          <Route path="/brand-dashboard/campaign/:campaignId" element={<CampaignDetails />} />
          <Route path="/brand-dashboard/digital-slotting" element={<DigitalSlotting />} />
          <Route path="/brand-dashboard/recipe-bidding" element={<RecipeBidding />} />
          <Route path="/grocer-dashboard/*" element={<GrocerDashboard />} />
          <Route path="/grocer-dashboard/coupons" element={<CouponManager />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
