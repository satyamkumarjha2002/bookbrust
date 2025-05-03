import { UserBook, BookStatus, DashboardStats } from '@/types';
import LocalStorageService from '../localStorage';
import { v4 as uuidv4 } from 'uuid';
import { authService } from './authService';

const USER_BOOKS_KEY = 'bookbrust_user_books';

export const userBookService = {
  // Get all books for current user
  getUserBooks: (): UserBook[] => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];
    
    const userBooks = LocalStorageService.get<Record<string, UserBook>>(USER_BOOKS_KEY) || {};
    return Object.values(userBooks).filter(book => book.userId === currentUser.id);
  },
  
  // Get user books by status
  getUserBooksByStatus: (status: BookStatus): UserBook[] => {
    const userBooks = userBookService.getUserBooks();
    return userBooks.filter(book => book.status === status);
  },
  
  // Get a specific user book
  getUserBook: (id: string): UserBook | null => {
    const userBooks = LocalStorageService.get<Record<string, UserBook>>(USER_BOOKS_KEY) || {};
    return userBooks[id] || null;
  },
  
  // Get user book by book ID
  getUserBookByBookId: (bookId: string): UserBook | null => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    const userBooks = LocalStorageService.get<Record<string, UserBook>>(USER_BOOKS_KEY) || {};
    const foundBook = Object.values(userBooks).find(
      book => book.bookId === bookId && book.userId === currentUser.id
    );
    
    return foundBook || null;
  },
  
  // Add a book to user's collection
  addUserBook: (bookId: string, status: BookStatus, rating?: number, notes?: string): UserBook | null => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    const userBooks = LocalStorageService.get<Record<string, UserBook>>(USER_BOOKS_KEY) || {};
    
    // Check if the book is already in the user's collection
    const existingBook = Object.values(userBooks).find(
      book => book.bookId === bookId && book.userId === currentUser.id
    );
    
    if (existingBook) {
      // Update the existing book
      return userBookService.updateUserBook(existingBook.id, { status, rating, notes });
    }
    
    // Add new book to collection
    const now = new Date().toISOString();
    const newUserBook: UserBook = {
      id: uuidv4(),
      userId: currentUser.id,
      bookId,
      status,
      rating,
      notes,
      dateAdded: now,
      dateUpdated: now
    };
    
    userBooks[newUserBook.id] = newUserBook;
    LocalStorageService.save(USER_BOOKS_KEY, userBooks);
    
    return newUserBook;
  },
  
  // Update a user book
  updateUserBook: (id: string, data: Partial<UserBook>): UserBook | null => {
    const userBooks = LocalStorageService.get<Record<string, UserBook>>(USER_BOOKS_KEY) || {};
    
    if (!userBooks[id]) return null;
    
    const updatedUserBook = { 
      ...userBooks[id], 
      ...data, 
      dateUpdated: new Date().toISOString() 
    };
    
    userBooks[id] = updatedUserBook;
    LocalStorageService.save(USER_BOOKS_KEY, userBooks);
    
    return updatedUserBook;
  },
  
  // Remove a book from user's collection
  removeUserBook: (id: string): boolean => {
    const userBooks = LocalStorageService.get<Record<string, UserBook>>(USER_BOOKS_KEY) || {};
    
    if (!userBooks[id]) return false;
    
    delete userBooks[id];
    LocalStorageService.save(USER_BOOKS_KEY, userBooks);
    
    return true;
  },
  
  // Get dashboard statistics
  getDashboardStats: (): DashboardStats => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      return {
        totalBooksRead: 0,
        currentlyReading: 0,
        wantToRead: 0
      };
    }
    
    const userBooks = userBookService.getUserBooks();
    
    return {
      totalBooksRead: userBooks.filter(book => book.status === BookStatus.FINISHED).length,
      currentlyReading: userBooks.filter(book => book.status === BookStatus.READING).length,
      wantToRead: userBooks.filter(book => book.status === BookStatus.WANT_TO_READ).length
    };
  },
  
  // Get the last book the user was reading with more detailed information
  getLastReadingBook: (): UserBook | null => {
    const readingBooks = userBookService.getUserBooksByStatus(BookStatus.READING);
    
    if (readingBooks.length === 0) {
      // Fallback: if no books are currently being read, check for the last updated book
      const allBooks = userBookService.getUserBooks();
      if (allBooks.length === 0) return null;
      
      // Sort all books by update date
      const sortedBooks = [...allBooks].sort((a, b) => 
        new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()
      );
      
      // Return the most recently updated book
      return sortedBooks[0];
    }
    
    // Check for reading sessions data if available
    try {
      // Sort by dateUpdated in descending order first
      const sortedBooks = [...readingBooks].sort((a, b) => 
        new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()
      );
      
      // Ensure we have a valid book ID before returning
      const selected = sortedBooks[0];
      
      // Check if the book exists in the database as an additional validation
      const exists = require('./bookService').bookService.getBookById(selected.bookId);
      if (!exists) {
        throw new Error('Book not found');
      }
      
      // Store this as the most recent reading book in localStorage
      // so the selection persists across sessions
      if (typeof window !== 'undefined') {
        localStorage.setItem('bookbrust_last_reading_book', selected.id);
      }
      
      return selected;
    } catch (error) {
      console.error('Error finding last reading book:', error);
      // If any error occurs, just return the first book in the reading list
      return readingBooks[0];
    }
  }
}; 