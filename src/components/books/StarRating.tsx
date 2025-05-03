import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, readOnly = false, size = 'md' }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  
  const handleClick = (rating: number) => {
    if (readOnly || !onChange) return;
    
    // Toggle off if clicking the same star
    onChange(rating === value ? 0 : rating);
  };
  
  // Determine star sizes based on the size prop
  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const containerClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };
  
  return (
    <div 
      className={cn(
        "flex items-center", 
        containerClasses[size],
        readOnly ? "pointer-events-none" : "cursor-pointer"
      )}
    >
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            starSizes[size],
            "transition-colors",
            star <= value 
              ? "fill-yellow-400 text-yellow-400" 
              : "fill-none text-muted-foreground"
          )}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
} 