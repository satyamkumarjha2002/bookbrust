import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookRecommendation } from '@/types/reading-features';
import { recommendationService } from '@/lib/services/readingFeaturesService';
import { userBookService } from '@/lib/services';
import { BookStatus } from '@/types';
import { LightbulbIcon, Plus, BookOpenIcon, BookmarkIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom event name for book added
export const BOOK_ADDED_EVENT = 'bookbrust:book-added';

export function BookRecommendations() {
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadRecommendations();
  }, []);
  
  const loadRecommendations = () => {
    setLoading(true);
    try {
      const recs = recommendationService.getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading book recommendations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addToLibrary = (bookId: string, status: BookStatus = BookStatus.WANT_TO_READ) => {
    try {
      userBookService.addUserBook(bookId, status);
      
      // Refresh recommendations after adding
      loadRecommendations();
      
      // Dispatch a custom event to notify other components that a book was added
      const event = new CustomEvent(BOOK_ADDED_EVENT, { 
        detail: { bookId, status } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error adding book to library:', error);
    }
  };
  
  const getConfidenceLabel = (score: number) => {
    if (score >= 90) return 'Excellent match';
    if (score >= 70) return 'Great match';
    if (score >= 50) return 'Good match';
    return 'Potential match';
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-orange-400';
  };
  
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LightbulbIcon className="h-5 w-5 mr-2" />
            Book Recommendations
          </CardTitle>
          <CardDescription>
            Discover new books based on your reading history
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            {loading 
              ? 'Loading recommendations...' 
              : 'Add more books to your library to get personalized recommendations.'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LightbulbIcon className="h-5 w-5 mr-2" />
          Book Recommendations
        </CardTitle>
        <CardDescription>
          Discover new books based on your reading history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map(rec => (
          <div 
            key={rec.bookId} 
            className="flex items-start space-x-4 border-b last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0"
          >
            <div className="flex-shrink-0 w-12 h-16 bg-muted rounded overflow-hidden">
              {rec.book.coverUrl ? (
                <img 
                  src={rec.book.coverUrl} 
                  alt={rec.book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <BookOpenIcon className="h-6 w-6 text-primary/40" />
                </div>
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium truncate">{rec.book.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.book.author}</p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${getScoreColor(rec.score)}`}
                    title={`${rec.score}% match`}
                  >
                    {rec.score}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {getConfidenceLabel(rec.score)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add to
                      <ChevronDownIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => addToLibrary(rec.bookId, BookStatus.WANT_TO_READ)}>
                      <BookmarkIcon className="h-4 w-4 mr-2" />
                      Want to Read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addToLibrary(rec.bookId, BookStatus.READING)}>
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      Currently Reading
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addToLibrary(rec.bookId, BookStatus.FINISHED)}>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Finished
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {rec.reason && (
                <p className="text-xs text-muted-foreground mt-2">
                  {rec.reason}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 