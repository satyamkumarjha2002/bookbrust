import { Book } from '@/types';
import LocalStorageService from '../localStorage';
import { v4 as uuidv4 } from 'uuid';

const BOOKS_KEY = 'bookbrust_books';

export const bookService = {
  // Get all books
  getAllBooks: (): Book[] => {
    const books = LocalStorageService.get<Record<string, Book>>(BOOKS_KEY) || {};
    return Object.values(books);
  },
  
  // Get a book by ID
  getBookById: (id: string): Book | null => {
    const books = LocalStorageService.get<Record<string, Book>>(BOOKS_KEY) || {};
    return books[id] || null;
  },
  
  // Add a new book
  addBook: (bookData: Omit<Book, 'id'>): Book => {
    const books = LocalStorageService.get<Record<string, Book>>(BOOKS_KEY) || {};
    
    const newBook: Book = {
      id: uuidv4(),
      ...bookData
    };
    
    books[newBook.id] = newBook;
    LocalStorageService.save(BOOKS_KEY, books);
    
    return newBook;
  },
  
  // Update a book
  updateBook: (id: string, bookData: Partial<Book>): Book | null => {
    const books = LocalStorageService.get<Record<string, Book>>(BOOKS_KEY) || {};
    
    if (!books[id]) return null;
    
    const updatedBook = { ...books[id], ...bookData };
    books[id] = updatedBook;
    
    LocalStorageService.save(BOOKS_KEY, books);
    
    return updatedBook;
  },
  
  // Delete a book
  deleteBook: (id: string): boolean => {
    const books = LocalStorageService.get<Record<string, Book>>(BOOKS_KEY) || {};
    
    if (!books[id]) return false;
    
    delete books[id];
    LocalStorageService.save(BOOKS_KEY, books);
    
    return true;
  },
  
  // Search books
  searchBooks: (query: string): Book[] => {
    const books = LocalStorageService.get<Record<string, Book>>(BOOKS_KEY) || {};
    const searchTerm = query.toLowerCase();
    
    return Object.values(books).filter(book => 
      book.title.toLowerCase().includes(searchTerm) || 
      book.author.toLowerCase().includes(searchTerm) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchTerm))
    );
  },
  
  // Get trending books
  getTrendingBooks: (limit: number = 5): Book[] => {
    const books = bookService.getAllBooks();
    if (books.length === 0) return [];
    
    // In a real app, this would use actual data from the backend
    // For our demo, we'll simulate popularity using random weights
    // and make sure we get different books each time
    const weighted = books.map(book => {
      // Create a deterministic but seemingly random score based on the book id
      // This ensures different books each time but consistent within a session
      const hash = book.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomFactor = (hash % 100) / 100; // 0-1 range
      
      // Base score influenced by book title length (just as a demo factor)
      const titleScore = Math.min(50, book.title.length) / 50; 
      
      // Calculate a composite score
      const trendingScore = (randomFactor * 0.7) + (titleScore * 0.3);
      
      return {
        ...book,
        trendingScore
      };
    });
    
    // Sort by trending score (descending)
    weighted.sort((a, b) => b.trendingScore - a.trendingScore);
    
    // Return the top N books
    return weighted.slice(0, limit);
  }
}; 