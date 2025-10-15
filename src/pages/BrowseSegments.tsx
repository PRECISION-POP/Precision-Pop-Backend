import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Segment {
  id: string;
  name: string;
  definition: any;
  customer_count: number;
  avg_basket_value: number;
}

const BrowseSegments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-lg">{segment.name}</span>
                    <Users className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <CardDescription>
                    {segment.definition?.description || "Custom AI segment"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                    <Button 
                      className="w-full mt-4"
                      onClick={() => navigate("/brand-dashboard/create-campaign", { 
                        state: { targetSegment: segment.name } 
                      })}
                    >
                      Target This Segment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseSegments;
