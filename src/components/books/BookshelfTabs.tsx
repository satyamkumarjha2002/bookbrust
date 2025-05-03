import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookStatus, Book, UserBook } from '@/types';
import { userBookService, bookService } from '@/lib/services';
import { BookCard } from './BookCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  FilterIcon, 
  ArrowUpDown, 
  Search, 
  ListIcon, 
  GridIcon,
  BookOpenIcon,
  CheckIcon,
  BookmarkIcon,
  XIcon,
  BarChartIcon,
  TagIcon,
  CalendarIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';
import { BookEditModal } from './BookEditModal';
import { AddBookModal } from './AddBookModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { BOOK_ADDED_EVENT } from './BookRecommendations';

// Type for bookshelf items with book details
type BookshelfItem = UserBook & { book: Book };

// Type for sort options
type SortOption = 'title' | 'author' | 'dateAdded' | 'dateUpdated' | 'rating';

// Type for filter options
type FilterOption = {
  key: string;
  value: string;
  label: string;
};

export function BookshelfTabs() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<BookStatus>(BookStatus.READING);
  
  // State for books data
  const [userBooks, setUserBooks] = useState<BookshelfItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for modal controls
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserBook, setSelectedUserBook] = useState<BookshelfItem | null>(null);
  
  // State for view options and filtering
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('dateUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // New state for advanced filtering
  const [showStats, setShowStats] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  
  // Load books and remember tab selection
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Restore saved view preferences
        const savedTab = localStorage.getItem('bookbrust_active_tab');
        if (savedTab && Object.values(BookStatus).includes(savedTab as BookStatus)) {
          setActiveTab(savedTab as BookStatus);
        }
        
        const savedViewMode = localStorage.getItem('bookbrust_view_mode');
        if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
          setViewMode(savedViewMode as 'grid' | 'list');
        }
        
        const savedSortBy = localStorage.getItem('bookbrust_sort_by');
        if (savedSortBy) {
          setSortBy(savedSortBy as SortOption);
        }
        
        const savedSortDirection = localStorage.getItem('bookbrust_sort_direction');
        if (savedSortDirection && (savedSortDirection === 'asc' || savedSortDirection === 'desc')) {
          setSortDirection(savedSortDirection as 'asc' | 'desc');
        }
        
        const savedShowStats = localStorage.getItem('bookbrust_show_stats');
        if (savedShowStats) {
          setShowStats(savedShowStats === 'true');
        }
        
        await loadBooks();
      } catch (error) {
        console.error('Error loading bookshelf data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Listen for the book added event
    const handleBookAdded = () => {
      loadBooks();
    };
    
    window.addEventListener(BOOK_ADDED_EVENT, handleBookAdded);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener(BOOK_ADDED_EVENT, handleBookAdded);
    };
  }, []);
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('bookbrust_active_tab', activeTab);
    localStorage.setItem('bookbrust_view_mode', viewMode);
    localStorage.setItem('bookbrust_sort_by', sortBy);
    localStorage.setItem('bookbrust_sort_direction', sortDirection);
    localStorage.setItem('bookbrust_show_stats', showStats.toString());
  }, [activeTab, viewMode, sortBy, sortDirection, showStats]);

  // Extract available filters from books
  const availableFilters = useMemo(() => {
    const authorFilters: FilterOption[] = [];
    const yearFilters: FilterOption[] = [];
    
    userBooks.forEach(item => {
      // Add author filter if not already present
      if (!authorFilters.find(f => f.value === item.book.author)) {
        authorFilters.push({
          key: 'author',
          value: item.book.author,
          label: item.book.author
        });
      }
      
      // Add year filter from date added
      const year = new Date(item.dateAdded).getFullYear().toString();
      if (!yearFilters.find(f => f.value === year)) {
        yearFilters.push({
          key: 'year',
          value: year,
          label: year
        });
      }
    });
    
    return {
      authors: authorFilters.sort((a, b) => a.label.localeCompare(b.label)),
      years: yearFilters.sort((a, b) => b.value.localeCompare(a.value))
    };
  }, [userBooks]);
  
  const loadBooks = async () => {
    // Get user books
    const allUserBooks = userBookService.getUserBooks();
    
    // Map to include book details
    const booksWithDetails = allUserBooks
      .map(userBook => {
        const book = bookService.getBookById(userBook.bookId);
        if (!book) return null;
        return {
          ...userBook,
          book
        } as BookshelfItem;
      })
      .filter((item): item is BookshelfItem => item !== null);
    
    setUserBooks(booksWithDetails);
  };
  
  const handleEditClick = (userBook: BookshelfItem) => {
    setSelectedUserBook(userBook);
    setIsEditModalOpen(true);
  };
  
  const handleEditSave = () => {
    setIsEditModalOpen(false);
    loadBooks();
  };
  
  const handleAddSave = () => {
    setIsAddModalOpen(false);
    loadBooks();
  };
  
  const toggleSortDirection = () => {
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  const handleClearFilters = () => {
    setSelectedAuthors([]);
    setSelectedRatings([]);
    setSelectedYears([]);
  };

  const toggleAuthorFilter = (author: string) => {
    setSelectedAuthors(prev => 
      prev.includes(author) 
        ? prev.filter(a => a !== author) 
        : [...prev, author]
    );
  };
  
  const toggleRatingFilter = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating) 
        : [...prev, rating]
    );
  };
  
  const toggleYearFilter = (year: string) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year) 
        : [...prev, year]
    );
  };
  
  // Reading statistics
  const bookStats = useMemo(() => {
    const totalBooks = userBooks.length;
    const totalRead = userBooks.filter(book => book.status === BookStatus.FINISHED).length;
    const averageRating = userBooks
      .filter(book => book.rating !== undefined && book.rating > 0)
      .reduce((sum, book) => sum + (book.rating || 0), 0) / 
      userBooks.filter(book => book.rating !== undefined && book.rating > 0).length || 0;
    
    const recentlyAdded = [...userBooks]
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 3);
    
    const topRated = [...userBooks]
      .filter(book => book.rating !== undefined && book.rating > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
      
    const authorCounts = userBooks.reduce((counts, book) => {
      const author = book.book.author;
      counts[author] = (counts[author] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const favoriteAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([author, count]) => ({ author, count }));
      
    const readingProgress = {
      wantToRead: userBooks.filter(book => book.status === BookStatus.WANT_TO_READ).length,
      reading: userBooks.filter(book => book.status === BookStatus.READING).length,
      finished: userBooks.filter(book => book.status === BookStatus.FINISHED).length,
    };
    
    return {
      totalBooks,
      totalRead,
      averageRating,
      recentlyAdded,
      topRated,
      favoriteAuthors,
      readingProgress
    };
  }, [userBooks]);
  
  // Filter and sort books based on current state
  const processedBooks = useMemo(() => {
    // First filter by tab/status
    let result = userBooks.filter(userBook => userBook.status === activeTab);
    
    // Then filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.book.title.toLowerCase().includes(query) || 
        item.book.author.toLowerCase().includes(query) ||
        (item.book.description && item.book.description.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply additional filters
    if (selectedAuthors.length > 0) {
      result = result.filter(book => selectedAuthors.includes(book.book.author));
    }
    
    if (selectedRatings.length > 0) {
      result = result.filter(book => 
        book.rating !== undefined && selectedRatings.includes(book.rating)
      );
    }
    
    if (selectedYears.length > 0) {
      result = result.filter(book => {
        const bookYear = new Date(book.dateAdded).getFullYear().toString();
        return selectedYears.includes(bookYear);
      });
    }
    
    // Then sort based on current sort criteria
    result = [...result].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.book.title.localeCompare(b.book.title);
          break;
        case 'author':
          comparison = a.book.author.localeCompare(b.book.author);
          break;
        case 'dateAdded':
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        case 'dateUpdated':
          comparison = new Date(a.dateUpdated).getTime() - new Date(b.dateUpdated).getTime();
          break;
        case 'rating':
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          comparison = ratingA - ratingB;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [userBooks, activeTab, searchQuery, sortBy, sortDirection, selectedAuthors, selectedRatings, selectedYears]);
  
  // Tab content with counters
  const tabContent = useMemo(() => {
    const statusCounts = {
      [BookStatus.READING]: userBooks.filter(book => book.status === BookStatus.READING).length,
      [BookStatus.FINISHED]: userBooks.filter(book => book.status === BookStatus.FINISHED).length,
      [BookStatus.WANT_TO_READ]: userBooks.filter(book => book.status === BookStatus.WANT_TO_READ).length,
    };
    
    return [
      { 
        status: BookStatus.READING, 
        label: 'Reading', 
        emoji: '📖', 
        count: statusCounts[BookStatus.READING],
        icon: <BookOpenIcon className="h-4 w-4" />,
        emptyMessage: "You're not reading any books at the moment."
      },
      { 
        status: BookStatus.FINISHED, 
        label: 'Finished', 
        emoji: '✅', 
        count: statusCounts[BookStatus.FINISHED],
        icon: <CheckIcon className="h-4 w-4" />,
        emptyMessage: "You haven't finished any books yet."
      },
      { 
        status: BookStatus.WANT_TO_READ, 
        label: 'Want to Read', 
        emoji: '📚', 
        count: statusCounts[BookStatus.WANT_TO_READ],
        icon: <BookmarkIcon className="h-4 w-4" />,
        emptyMessage: "You don't have any books you want to read yet."
      }
    ];
  }, [userBooks]);
  
  // Whether to show active filters indicator
  const hasActiveFilters = selectedAuthors.length > 0 || selectedRatings.length > 0 || selectedYears.length > 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          My Bookshelf
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            {userBooks.length} books
          </Badge>
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowStats(!showStats)}
            title="Show/Hide Reading Stats"
          >
            <BarChartIcon className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>
      
      {showStats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookStats.totalBooks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Books Read</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookStats.totalRead}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((bookStats.totalRead / bookStats.totalBooks || 0) * 100)}% of your collection
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-3xl font-bold mb-1">
                  {bookStats.averageRating.toFixed(1)}
                </div>
                <StarRating value={Math.round(bookStats.averageRating)} readOnly size="sm" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Favorite Authors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {bookStats.favoriteAuthors.length > 0 ? (
                  <div className="space-y-1">
                    {bookStats.favoriteAuthors.map(({ author, count }) => (
                      <div key={author} className="flex justify-between">
                        <span className="truncate">{author}</span>
                        <span className="text-muted-foreground">{count} books</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No data yet</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as BookStatus)}
        className="w-full"
      >
        <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <TabsList className="h-auto p-1">
            {tabContent.map(tab => (
              <TabsTrigger 
                key={tab.status}
                value={tab.status}
                id={tab.status === BookStatus.WANT_TO_READ ? "want-to-read-tab" : undefined}
                className="px-3 py-2 h-9 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center">
                  {tab.icon}
                  <span className="ml-1.5">{tab.label}</span>
                  <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 h-5 min-w-5 text-xs">
                    {tab.count}
                  </Badge>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search books..." 
                className="pl-8 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-2 top-2.5"
                  onClick={handleClearSearch}
                >
                  <XIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <TagIcon className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 bg-primary rounded-full w-2 h-2" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Filter by Author</h4>
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {availableFilters.authors.map(author => (
                            <div key={author.value} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`author-${author.value}`} 
                                checked={selectedAuthors.includes(author.value)}
                                onCheckedChange={() => toggleAuthorFilter(author.value)}
                              />
                              <label 
                                htmlFor={`author-${author.value}`}
                                className="text-sm cursor-pointer"
                              >
                                {author.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Filter by Rating</h4>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            onClick={() => toggleRatingFilter(rating)}
                            className={cn(
                              "flex items-center border rounded p-1",
                              selectedRatings.includes(rating) 
                                ? "border-primary bg-primary/10" 
                                : "border-muted"
                            )}
                          >
                            <StarRating value={rating} readOnly size="sm" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Filter by Year Added</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableFilters.years.map(year => (
                          <button
                            key={year.value}
                            onClick={() => toggleYearFilter(year.value)}
                            className={cn(
                              "px-2 py-1 text-xs rounded",
                              selectedYears.includes(year.value)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {year.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearFilters}
                        className="w-full mt-2"
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <span className="truncate text-xs">
                      {sortBy === 'title' ? 'Title' : 
                       sortBy === 'author' ? 'Author' : 
                       sortBy === 'dateAdded' ? 'Date Added' : 
                       sortBy === 'dateUpdated' ? 'Date Updated' : 
                       'Rating'}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="dateAdded">Date Added</SelectItem>
                  <SelectItem value="dateUpdated">Date Updated</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleSortDirection}
                title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                title={`Switch to ${viewMode === 'grid' ? 'List' : 'Grid'} View`}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? (
                  <ListIcon className="h-4 w-4" />
                ) : (
                  <GridIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="mb-4 flex items-center text-sm">
            <span className="text-muted-foreground mr-2">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {selectedAuthors.map(author => (
                <Badge key={`author-${author}`} variant="secondary" className="gap-1">
                  <span>{author}</span>
                  <XIcon 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleAuthorFilter(author)}
                  />
                </Badge>
              ))}
              
              {selectedRatings.map(rating => (
                <Badge key={`rating-${rating}`} variant="secondary" className="gap-1">
                  <span>{rating} ★</span>
                  <XIcon 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleRatingFilter(rating)}
                  />
                </Badge>
              ))}
              
              {selectedYears.map(year => (
                <Badge key={`year-${year}`} variant="secondary" className="gap-1">
                  <span>{year}</span>
                  <XIcon 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleYearFilter(year)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          Object.values(BookStatus).map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {processedBooks.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {processedBooks.map((userBook) => (
                      <BookCard
                        key={userBook.id}
                        book={userBook.book}
                        status={userBook.status}
                        rating={userBook.rating}
                        onEditClick={() => handleEditClick(userBook)}
                        onClick={() => window.location.href = `/books/${userBook.book.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 border rounded-md">
                    {processedBooks.map((userBook) => (
                      <div 
                        key={userBook.id} 
                        className="flex items-center p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                      >
                        <div className="flex-shrink-0 mr-4 w-12 h-16 relative">
                          <img 
                            src={userBook.book.coverUrl || '/images/default-book-cover.jpg'} 
                            alt={userBook.book.title}
                            className="w-full h-full object-cover rounded-sm"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-sm md:text-base">{userBook.book.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">{userBook.book.author}</p>
                          {userBook.rating !== undefined && userBook.rating > 0 && (
                            <div className="mt-1">
                              <StarRating value={userBook.rating} readOnly size="sm" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClick(userBook)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12 border rounded-md bg-muted/10">
                  {searchQuery ? (
                    <>
                      <p className="text-muted-foreground mb-4">
                        No books found matching your search.
                      </p>
                      <Button variant="outline" onClick={handleClearSearch}>
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-4">
                        {tabContent.find(tab => tab.status === status)?.emptyMessage}
                      </p>
                      <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Your First Book
                      </Button>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          ))
        )}
      </Tabs>
      
      {selectedUserBook && (
        <BookEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userBook={selectedUserBook}
          onSave={handleEditSave}
        />
      )}
      
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSave}
        initialStatus={activeTab}
      />
    </div>
  );
} 