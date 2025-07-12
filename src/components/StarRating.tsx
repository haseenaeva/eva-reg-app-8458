
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleStarClick = (starValue: number) => {
    if (readOnly) return;
    
    setRating(starValue);
    onRatingChange?.(starValue);
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
          disabled={readOnly}
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
          Rate {agentName}
        </span>
      )}
    </div>
  );
};
