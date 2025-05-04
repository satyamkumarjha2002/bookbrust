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
import { DashboardStats, BookStatus, Book, UserBook } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpenIcon, 
  BookmarkIcon, 
  BookIcon, 
  TrendingUpIcon, 
  ChevronDownIcon, 
  CheckIcon 
} from 'lucide-react';
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

// Define a proper interface for the lastReadingBook state
interface LastReadingBookData {
  book: Book;
  bookId: string;
  dateUpdated: string;
  notes?: string;
  status: BookStatus;
  rating?: number;
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
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBooksRead: 0,
    currentlyReading: 0,
    wantToRead: 0
  });
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [lastReadingBook, setLastReadingBook] = useState<LastReadingBookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track render count for debugging
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;
  console.log('Dashboard render count:', renderCountRef.current);
  
  // Function to load dashboard data
  const loadDashboardData = async () => {
    const loadId = Date.now(); // Generate unique ID for this load call
    console.log(`[${loadId}] loadDashboardData started`);
    try {
      // Clear any previous errors
      setError(null);
      
      // Load dashboard statistics
      console.log(`[${loadId}] Calling getDashboardStats`);
      const dashboardStats = await userBookService.getDashboardStats();
      console.log(`[${loadId}] getDashboardStats result:`, dashboardStats);
      setStats(dashboardStats);
      
      // Load last reading book
      console.log(`[${loadId}] Calling getLastReadingBook`);
      const lastBook = await userBookService.getLastReadingBook();
      console.log(`[${loadId}] getLastReadingBook result:`, lastBook);
      
      if (lastBook) {
        console.log(`[${loadId}] Calling getBookById for lastBook:`, lastBook.bookId);
        const bookDetails = await bookService.getBookById(lastBook.bookId);
        console.log(`[${loadId}] getBookById result:`, bookDetails);
        
        if (bookDetails) {
          console.log(`[${loadId}] Setting lastReadingBook state`);
          setLastReadingBook({
            ...lastBook,
            book: bookDetails
          } as LastReadingBookData);
        }
      }
      
      // Load trending books
      console.log(`[${loadId}] Calling getTrendingBooks`);
      const trending = await bookService.getTrendingBooks(5);
      console.log(`[${loadId}] getTrendingBooks result:`, trending.length, 'books');
      setTrendingBooks(trending);
      
      // Update reading challenge progress
      try {
        console.log(`[${loadId}] Calling updateProgress with count:`, dashboardStats.totalBooksRead);
        await Promise.resolve(readingFeaturesService.challenges.updateProgress(dashboardStats.totalBooksRead));
        console.log(`[${loadId}] updateProgress completed`);
      } catch (error) {
        console.error(`[${loadId}] Error updating reading challenge:`, error);
      }
      
      console.log(`[${loadId}] loadDashboardData completed successfully`);
      return dashboardStats.totalBooksRead;
    } catch (error) {
      console.error(`[${loadId}] Error loading dashboard data:`, error);
      setError('Failed to load dashboard data. Please try again later.');
      // Set default/empty values
      setStats({
        totalBooksRead: 0,
        currentlyReading: 0,
        wantToRead: 0
      });
      setTrendingBooks([]);
      return 0;
    }
  };

  // Load data when component mounts
  useEffect(() => {
    // Only proceed if we're on the client side
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('Setting up data loading...');
    
    // Flag to prevent state updates after unmount
    let isMounted = true;
    
    console.log('Starting data load process...');
    loadDashboardData()
      .then((result) => {
        console.log('Data loading completed with result:', result);
        if (isMounted) {
          console.log('Setting loading state to false');
          setIsLoading(false);
        } else {
          console.log('Component unmounted, skipping state update');
        }
      })
      .catch((error) => {
        console.error('Error in dashboard data loading:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      });
    
    return () => {
      console.log('Dashboard useEffect cleanup running');
      isMounted = false;
    };
  }, []); // Intentionally excluding router and other values
  
  const handleAddBook = async (bookId: string, status: BookStatus) => {
    console.log('handleAddBook called with:', { bookId, status });
    try {
      console.log('Calling userBookService.addUserBook');
      await userBookService.addUserBook(bookId, status);
      
      // Dispatch custom event
      console.log('Dispatching BOOK_ADDED_EVENT');
      const event = new CustomEvent(BOOK_ADDED_EVENT, { 
        detail: { bookId, status } 
      });
      window.dispatchEvent(event);
      
      // Reload dashboard data
      console.log('Reloading dashboard data after book add');
      loadDashboardData();
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };
  
  const navigateToBookDetail = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };
  
  // Show error state if we have an error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 border rounded-lg bg-red-50 text-red-800 mb-6">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Button onClick={() => {
            setIsLoading(true);
            loadDashboardData().then(() => setIsLoading(false));
          }} className="mt-4">
            Try Again
          </Button>
        </div>
        
        {/* Still show the bookshelves even if we have an error */}
        <BookshelfTabs />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Reading Challenge */}
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
          
          {/* Continue Reading Section */}
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
        
          {/* Trending Books */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Trending Books</h2>
              <Button 
                variant="link" 
                className="text-primary"
                onClick={() => {
                  setIsLoading(true);
                  loadDashboardData().then(() => setIsLoading(false));
                }}
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
                                handleAddBook(book.id, BookStatus.WANT_TO_READ);
                              }}
                            >
                              <BookmarkIcon className="h-4 w-4 mr-2" />
                              Want to Read
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddBook(book.id, BookStatus.READING);
                              }}
                            >
                              <BookOpenIcon className="h-4 w-4 mr-2" />
                              Currently Reading
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddBook(book.id, BookStatus.FINISHED);
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
          {/* Reading Insights */}
          <ReadingInsights />
          
          {/* Book Recommendations */}
          <BookRecommendations />
          
          {/* Reading Reminders */}
          <ReadingReminders />
        </div>
      </div>
      
      {/* My Bookshelf */}
      <BookshelfTabs />
    </div>
  );
} 