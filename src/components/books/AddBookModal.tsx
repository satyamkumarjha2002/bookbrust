import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookStatus, Book } from '@/types';
import { userBookService, bookService } from '@/lib/services';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { seedBooksData } from '@/lib/seedData';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialStatus?: BookStatus;
}

export function AddBookModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialStatus = BookStatus.WANT_TO_READ 
}: AddBookModalProps) {
  
  // State for "Add New Book" tab
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<BookStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    author?: string;
  }>({});

  // State for "Select Existing Books" tab
  const [activeTab, setActiveTab] = useState<string>("new-book");
  const [existingBooks, setExistingBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>(initialStatus);
  const [debugInfo, setDebugInfo] = useState('');

  // Load existing books
  useEffect(() => {
    if (isOpen) {
      loadExistingBooks();
    }
  }, [isOpen, activeTab]);

  const loadExistingBooks = async () => {
    try {
      // Force seed if needed
      seedBooksData();
      
      const allBooks = await bookService.getAllBooks();
      if (allBooks.length === 0) {
        console.log("No books found in localStorage");
        setDebugInfo("No books found in localStorage");
      } else {
        console.log(`Found ${allBooks.length} books in localStorage`);
        setDebugInfo(`Found ${allBooks.length} books in localStorage`);
      }
      
      // Filter out books that are already in the user's collection
      const userBooks = await userBookService.getUserBooks();
      const userBookIds = userBooks.map((ub) => ub.bookId);
      const availableBooks = allBooks.filter((book) => !userBookIds.includes(book.id));
      setExistingBooks(availableBooks);
    } catch (error) {
      console.error("Error loading books:", error);
      setDebugInfo(`Error: ${error}`);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setIsbn('');
    setDescription('');
    setStatus(initialStatus);
    setErrors({});
    setSelectedBookIds([]);
    setSelectedStatus(initialStatus);
    setActiveTab("new-book");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: {
      title?: string;
      author?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!author.trim()) {
      newErrors.author = "Author is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitNewBook = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the book
      const newBook = await bookService.addBook({
        title: title.trim(),
        author: author.trim(),
        coverUrl: coverUrl.trim() || undefined,
        isbn: isbn.trim() || undefined,
        description: description.trim() || undefined,
      });
      
      // Check if the book was created successfully
      if (!newBook) {
        console.error('Failed to create book');
        return;
      }
      
      // Now TypeScript knows newBook is not null
      await userBookService.addUserBook(
        newBook.id,
        status,
        undefined,
        undefined
      );
      
      resetForm();
      onSave();
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitExistingBooks = async () => {
    if (selectedBookIds.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Add selected books to user's collection
      await Promise.all(
        selectedBookIds.map(bookId => 
          userBookService.addUserBook(
            bookId,
            selectedStatus,
            undefined,
            undefined
          )
        )
      );
      
      resetForm();
      onSave();
    } catch (error) {
      console.error('Error adding books:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === "new-book") {
      handleSubmitNewBook();
    } else {
      handleSubmitExistingBooks();
    }
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBookIds(prev => 
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleDebugClick = () => {
    loadExistingBooks();
    const booksContent = localStorage.getItem('bookbrust_books');
    if (booksContent) {
      try {
        const parsed = JSON.parse(booksContent);
        setDebugInfo(`Books in LocalStorage: ${Object.keys(parsed).length}\n${Object.values(parsed).map((book: any) => book.title).join(', ')}`);
      } catch (e) {
        setDebugInfo(`Error parsing books: ${e}`);
      }
    } else {
      setDebugInfo('No books in localStorage');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Book to Shelf</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="new-book">Add New Book</TabsTrigger>
            <TabsTrigger value="existing-books">Select Existing Books</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-book" className="pt-2">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter book title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter author name"
                  className={errors.author ? "border-red-500" : ""}
                />
                {errors.author && (
                  <p className="text-red-500 text-sm">{errors.author}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input
                  id="cover"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Enter URL for cover image (optional)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Enter ISBN (optional)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as BookStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BookStatus.READING}>Reading</SelectItem>
                    <SelectItem value={BookStatus.FINISHED}>Finished</SelectItem>
                    <SelectItem value={BookStatus.WANT_TO_READ}>Want to Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter book description (optional)"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="existing-books" className="pt-2">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="selected-status">Add to shelf as</Label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={(value) => setSelectedStatus(value as BookStatus)}
                >
                  <SelectTrigger id="selected-status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BookStatus.READING}>Reading</SelectItem>
                    <SelectItem value={BookStatus.FINISHED}>Finished</SelectItem>
                    <SelectItem value={BookStatus.WANT_TO_READ}>Want to Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center">
                <Button onClick={handleDebugClick} variant="outline" size="sm" type="button">
                  Refresh Books List
                </Button>
                {debugInfo && <span className="text-xs text-muted-foreground">Books: {existingBooks.length}</span>}
              </div>
              
              <div className="border rounded-md">
                <ScrollArea className="h-[300px] pr-4">
                  {existingBooks.length === 0 ? (
                    <div className="text-center p-6 text-muted-foreground">
                      <p>No books available to add. All books are already in your collection.</p>
                      {debugInfo && <p className="text-xs mt-2">{debugInfo}</p>}
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {existingBooks.map(book => (
                        <div
                          key={book.id}
                          className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                          onClick={() => toggleBookSelection(book.id)}
                        >
                          <Checkbox
                            id={`book-${book.id}`}
                            checked={selectedBookIds.includes(book.id)}
                            onCheckedChange={() => toggleBookSelection(book.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center space-x-3 flex-grow">
                            <div className="w-10 h-14 flex-shrink-0 bg-muted">
                              {book.coverUrl && (
                                <img
                                  src={book.coverUrl}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <Label
                                htmlFor={`book-${book.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {book.title}
                              </Label>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {selectedBookIds.length > 0
                  ? `${selectedBookIds.length} book${selectedBookIds.length > 1 ? 's' : ''} selected`
                  : 'Select books to add to your shelf'}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || (activeTab === "existing-books" && selectedBookIds.length === 0)}
            type="button"
          >
            {activeTab === "new-book" ? "Add Book" : `Add ${selectedBookIds.length} Book${selectedBookIds.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 