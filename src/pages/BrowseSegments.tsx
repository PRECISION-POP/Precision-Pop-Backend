import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, DollarSign, TrendingUp, Target, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Segment {
  id: string;
  name: string;
  definition: any;
  customer_count: number;
  avg_basket_value: number;
  updated_at: string;
}

const BrowseSegments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const getSegmentIcon = (type: string) => {
    switch(type) {
      case 'conquest': return <Target className="h-4 w-4 text-orange-500" />;
      case 'loyalty': return <Users className="h-4 w-4 text-blue-500" />;
      case 'high-value': return <DollarSign className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    const { data, error } = await supabase
      .from("customer_segments")
      .select("*")
      .order("customer_count", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load segments",
        variant: "destructive",
      });
    } else {
      setSegments(data || []);
    }
    setLoading(false);
  };

  const filteredSegments = segments.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const segmentType = s.definition?.type || 'behavioral';
    const matchesFilter = filterType === "all" || segmentType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Browse Customer Segments</h1>
            <p className="text-muted-foreground">AI-generated micro-segments for precise targeting</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading segments...</div>
        ) : segments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No segments available yet</p>
              <p className="text-sm">Segments will appear here once customer data is analyzed</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <Input 
                placeholder="Search segments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="loyalty">Loyalty</SelectItem>
                  <SelectItem value="conquest">Conquest</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                  <SelectItem value="high-value">High Value</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSegments.map((segment) => {
                const isHot = segment.customer_count > 5000 && segment.avg_basket_value > 50;
                const segmentType = segment.definition?.type || 'behavioral';
                
                return (
                  <Card key={segment.id} className="hover:shadow-lg transition-shadow relative">
                    {isHot && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                          🔥 Hot
                        </span>
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span className="text-lg">{segment.name}</span>
                        {getSegmentIcon(segmentType)}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span>AI-Generated • Updated {formatDistanceToNow(new Date(segment.updated_at), { addSuffix: true })}</span>
                        </div>
                        {segment.definition?.description || "Custom AI segment"}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Customers</span>
                          <span className="font-semibold">{segment.customer_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Avg Basket</span>
                          <span className="font-semibold flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {segment.avg_basket_value.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Segment Insights */}
                      <div className="border-t pt-3 space-y-2 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                            {segmentType.charAt(0).toUpperCase() + segmentType.slice(1)}
                          </span>
                          {segment.definition?.frequency && (
                            <span className="text-xs text-muted-foreground">
                              Shops {segment.definition.frequency}
                            </span>
                          )}
                        </div>
                        {segment.definition?.top_categories && (
                          <p className="text-xs text-muted-foreground">
                            Top categories: {segment.definition.top_categories.join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Estimated Reach */}
                      <div className="bg-primary/5 rounded p-3 mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Est. Weekly Reach</p>
                        <p className="text-lg font-bold">
                          {(segment.customer_count * 0.3).toLocaleString()} impressions
                        </p>
                      </div>

                      {/* Historical Performance */}
                      {(segment.definition?.avg_accept_rate || segment.definition?.avg_redemption_rate) && (
                        <div className="border-t pt-3 mb-3">
                          <p className="text-xs font-semibold mb-2">Historical Performance:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {segment.definition?.avg_accept_rate && (
                              <div>
                                <span className="text-muted-foreground">Avg Accept:</span>
                                <span className="font-semibold ml-1 text-green-600">
                                  {segment.definition.avg_accept_rate}%
                                </span>
                              </div>
                            )}
                            {segment.definition?.avg_redemption_rate && (
                              <div>
                                <span className="text-muted-foreground">Avg Redeem:</span>
                                <span className="font-semibold ml-1 text-green-600">
                                  {segment.definition.avg_redemption_rate}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Conquest Opportunity */}
                      {segment.definition?.competitor_brand && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3">
                          <p className="text-xs text-orange-800">
                            <strong>Conquest Opportunity:</strong> Target {segment.definition.competitor_brand} loyalists
                          </p>
                        </div>
                      )}

                      <Button 
                        className="w-full"
                        onClick={() => navigate("/brand-dashboard/create-campaign", { 
                          state: { targetSegment: segment.name } 
                        })}
                      >
                        Target This Segment
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseSegments;
