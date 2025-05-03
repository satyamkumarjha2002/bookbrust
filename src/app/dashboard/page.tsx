"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ReadingChallengeComponent, 
  ReadingInsights,
  ReadingReminders,
  BookRecommendations
} from '@/components/books/ReadingFeatures';
import { BOOK_ADDED_EVENT } from '@/components/books/BookRecommendations';
import { BookshelfTabs } from '@/components/books/BookshelfTabs';
import { bookService, userBookService, readingFeaturesService, authService } from '@/lib/services';
import { DashboardStats, BookStatus, Book } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpenIcon, 
  BookmarkIcon, 
  BookIcon, 
  TrendingUpIcon, 
  ChevronDownIcon, 
  CheckIcon 
} from 'lucide-react';
import { useSeedData } from '@/hooks/useSeedData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Stats card component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="bg-muted p-2 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  // Use the seed data hook to initialize book data
  const dataSeeded = useSeedData();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBooksRead: 0,
    currentlyReading: 0,
    wantToRead: 0
  });
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [lastReadingBook, setLastReadingBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    // Only proceed if we're on the client side
    if (!isClient) return;
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Load dashboard data only when data is seeded
    if (dataSeeded) {
      loadDashboardData();
      setIsLoading(false);
    }
  }, [router, isClient, dataSeeded]);
  
  const loadDashboardData = () => {
    try {
      // Load stats
      const dashboardStats = userBookService.getDashboardStats();
      setStats(dashboardStats);
      
      // Load last reading book
      const lastBook = userBookService.getLastReadingBook();
      if (lastBook) {
        const bookDetails = bookService.getBookById(lastBook.bookId);
        if (bookDetails) {
          setLastReadingBook({
            ...lastBook,
            book: bookDetails
          });
        }
      }
      
      // Load trending books
      const trending = bookService.getTrendingBooks(5);
      setTrendingBooks(trending);

      // Update reading challenge progress
      readingFeaturesService.challenges.updateProgress();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const navigateToBookDetail = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };
  
  // Show loading state when on server or still loading
  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Reading Challenge - NEW */}
          <ReadingChallengeComponent />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Books Read" 
              value={stats.totalBooksRead}
              icon={<BookIcon className="h-6 w-6 text-green-500" />}
              description="Total books you've finished"
            />
            <StatCard 
              title="Currently Reading" 
              value={stats.currentlyReading}
              icon={<BookOpenIcon className="h-6 w-6 text-blue-500" />}
              description="Books in progress"
            />
            <StatCard 
              title="Want to Read" 
              value={stats.wantToRead}
              icon={<BookmarkIcon className="h-6 w-6 text-amber-500" />}
              description="Books on your wishlist"
            />
          </div>
          
          {/* Continue Reading Section - Improved */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
            {lastReadingBook && lastReadingBook.book ? (
              <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-1/3 aspect-[2/3] max-w-[180px]">
                    <img 
                      src={lastReadingBook.book.coverUrl || '/images/default-book-cover.jpg'} 
                      alt={lastReadingBook.book.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{lastReadingBook.book.title}</h3>
                      <p className="text-muted-foreground mb-2">{lastReadingBook.book.author}</p>
                      {lastReadingBook.notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium">Your notes:</p>
                          <p className="text-sm text-muted-foreground italic line-clamp-2">
                            "{lastReadingBook.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Last read: {new Date(lastReadingBook.dateUpdated).toLocaleDateString()}
                      </span>
                      <Button 
                        onClick={() => navigateToBookDetail(lastReadingBook.book.id)}
                        className="mt-2"
                      >
                        Continue Reading
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center bg-muted/20">
                <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No books in progress</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any books you're currently reading.
                </p>
                <Button onClick={() => document.querySelector('#want-to-read-tab')?.scrollIntoView()}>
                  Find a book to read
                </Button>
              </div>
            )}
          </div>
        
          {/* Trending Books - Improved */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Trending Books</h2>
              <Button 
                variant="link" 
                className="text-primary"
                onClick={() => loadDashboardData()}
              >
                <TrendingUpIcon className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            
            {trendingBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {trendingBooks.slice(0, 3).map(book => (
                  <div 
                    key={book.id} 
                    className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateToBookDetail(book.id)}
                  >
                    <div className="relative aspect-[2/3] w-full">
                      <img 
                        src={book.coverUrl || '/images/default-book-cover.jpg'} 
                        alt={book.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">Trending</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <BookmarkIcon className="h-4 w-4 mr-1" /> 
                              Add to
                              <ChevronDownIcon className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                userBookService.addUserBook(book.id, BookStatus.WANT_TO_READ);
                                
                                // Dispatch a custom event to notify other components that a book was added
                                const event = new CustomEvent(BOOK_ADDED_EVENT, { 
                                  detail: { bookId: book.id, status: BookStatus.WANT_TO_READ } 
                                });
                                window.dispatchEvent(event);
                                
                                loadDashboardData();
                              }}
                            >
                              <BookmarkIcon className="h-4 w-4 mr-2" />
                              Want to Read
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                userBookService.addUserBook(book.id, BookStatus.READING);
                                
                                // Dispatch a custom event to notify other components that a book was added
                                const event = new CustomEvent(BOOK_ADDED_EVENT, { 
                                  detail: { bookId: book.id, status: BookStatus.READING } 
                                });
                                window.dispatchEvent(event);
                                
                                loadDashboardData();
                              }}
                            >
                              <BookOpenIcon className="h-4 w-4 mr-2" />
                              Currently Reading
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                userBookService.addUserBook(book.id, BookStatus.FINISHED);
                                
                                // Dispatch a custom event to notify other components that a book was added
                                const event = new CustomEvent(BOOK_ADDED_EVENT, { 
                                  detail: { bookId: book.id, status: BookStatus.FINISHED } 
                                });
                                window.dispatchEvent(event);
                                
                                loadDashboardData();
                              }}
                            >
                              <CheckIcon className="h-4 w-4 mr-2" />
                              Finished
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center bg-muted/20">
                <TrendingUpIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No trending books available</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any trending books right now.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Reading Insights - NEW */}
          <ReadingInsights />
          
          {/* Book Recommendations - NEW */}
          <BookRecommendations />
          
          {/* Reading Reminders - NEW */}
          <ReadingReminders />
        </div>
      </div>
      
      {/* My Bookshelf */}
      <BookshelfTabs />
    </div>
  );
} 