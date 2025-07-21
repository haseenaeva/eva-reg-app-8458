
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";

interface StarRatingProps {
  agentId: string;
  agentName: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

export const StarRating = ({ 
  agentId, 
  agentName, 
  initialRating = 0, 
  onRatingChange,
  readOnly = false 
}: StarRatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExistingRating();
  }, [agentId]);

  const fetchExistingRating = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.AGENT_RATINGS)
        .select('rating')
        .eq('agent_id', agentId)
        .eq('rated_by', 'admin') // You can make this dynamic based on current user
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setRating(data.rating);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleStarClick = async (starValue: number) => {
    if (readOnly || isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await typedSupabase
        .from(TABLES.AGENT_RATINGS)
        .upsert({
          agent_id: agentId,
          rated_by: 'admin', // You can make this dynamic based on current user
          rating: starValue
        }, {
          onConflict: 'agent_id,rated_by'
        });

      if (error) throw error;

      setRating(starValue);
      onRatingChange?.(starValue);
      toast({
        title: "Rating Updated",
        description: `${agentName} rated ${starValue} star${starValue !== 1 ? 's' : ''}`
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Error",
        description: "Failed to save rating",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (readOnly) return;
    setHoveredRating(starValue);
  };

  const handleStarLeave = () => {
    if (readOnly) return;
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <Button
          key={starValue}
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 hover:bg-transparent"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          onMouseLeave={handleStarLeave}
          disabled={readOnly || isLoading}
        >
          <Star
            className={`h-4 w-4 ${
              starValue <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${!readOnly ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          />
        </Button>
      ))}
      {!readOnly && (
        <span className="text-xs text-gray-500 ml-2">
          {rating > 0 ? `${rating}/5` : `Rate ${agentName}`}
        </span>
      )}
    </div>
  );
};
