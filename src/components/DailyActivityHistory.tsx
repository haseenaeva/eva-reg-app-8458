import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, History } from "lucide-react";
import { format, parseISO } from "date-fns";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";

interface DailyActivity {
  id: string;
  agent_id: string;
  mobile_number: string;
  activity_date: string;
  activity_description: string;
  created_at: string;
}

interface DailyActivityHistoryProps {
  agentId: string;
  agentName: string;
}

export const DailyActivityHistory = ({ agentId, agentName }: DailyActivityHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.DAILY_ACTIVITIES)
        .select('*')
        .eq('agent_id', agentId)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activity history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, agentId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity History - {agentName}</DialogTitle>
          <DialogDescription>
            View all daily activities logged for this agent
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading activities...</p>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(parseISO(activity.activity_date), 'PPP')}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {format(parseISO(activity.created_at), 'MMM dd, yyyy')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {activity.activity_description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-600">
              No daily activities have been logged for {agentName} yet.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};