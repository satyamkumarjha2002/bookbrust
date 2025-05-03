import React from 'react';
import { Book, BookStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/books/StarRating';
import { BookOpenIcon, CheckIcon, BookmarkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookCardProps {
  book: Book;
  status?: BookStatus;
  rating?: number;
  showActions?: boolean;
  onEditClick?: () => void;
  onClick?: () => void;
}

export function BookCard({ 
  book, 
  status, 
  rating, 
  showActions = true, 
  onEditClick,
  onClick
}: BookCardProps) {
  const router = useRouter();

  const statusInfo = {
    [BookStatus.READING]: {
      label: 'Reading',
      icon: <BookOpenIcon className="h-3 w-3" />,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
    },
    [BookStatus.FINISHED]: {
      label: 'Finished',
      icon: <CheckIcon className="h-3 w-3" />,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
    },
    [BookStatus.WANT_TO_READ]: {
      label: 'Want to Read',
      icon: <BookmarkIcon className="h-3 w-3" />,
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
    }
  };

  // Default cover image if none provided
  const coverUrl = book.coverUrl || '/images/default-book-cover.jpg';
  
  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking the edit button, don't navigate
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Use custom onClick if provided, otherwise navigate to book detail page
    if (onClick) {
      onClick();
    } else {
      router.push(`/books/${book.id}`);
    }
  };
  
  return (
    <Card 
      className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={coverUrl} 
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {status && (
          <Badge 
            className={`absolute top-2 left-2 text-xs font-normal px-2 ${statusInfo[status].color}`}
          >
            <span className="flex items-center">
              {statusInfo[status].icon}
              <span className="ml-1">{statusInfo[status].label}</span>
            </span>
          </Badge>
        )}
      </div>
      
      <CardContent className="flex-1 flex flex-col pt-4">
        <h3 className="font-medium line-clamp-2 mb-1 leading-tight">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
        
        {rating !== undefined && rating > 0 && (
          <div className="mt-auto pt-1">
            <StarRating value={rating} readOnly />
          </div>
        )}
      </CardContent>
      
      {showActions && onEditClick && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
          >
            Edit
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 