import axiosInstance from '../axiosInstance';
import { UserBook, BookStatus, DashboardStats } from '@/types/index';

// This service will interact with our backend API for user book operations
export const apiUserBookService = {
  // Get all user books
  async getUserBooks(): Promise<UserBook[]> {
    try {
      const response = await axiosInstance.get('/user-books');
      return response.data;
    } catch (error) {
      console.error('Error fetching user books:', error);
      return [];
    }
  },
  
  // Get user books by status
  async getUserBooksByStatus(status: BookStatus): Promise<UserBook[]> {
    try {
      const response = await axiosInstance.get(`/user-books/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user books with status ${status}:`, error);
      return [];
    }
  },
  
  // Get user book by ID
  async getUserBook(id: string): Promise<UserBook | null> {
    try {
      const response = await axiosInstance.get(`/user-books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user book ${id}:`, error);
      return null;
    }
  },
  
  // Get user book by book ID
  async getUserBookByBookId(bookId: string): Promise<UserBook | null> {
    try {
      const response = await axiosInstance.get(`/user-books/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user book for book ${bookId}:`, error);
      return null;
    }
  },
  
  // Add a book to user's collection
  async addUserBook(
    bookId: string,
    status: BookStatus,
    rating?: number,
    notes?: string
  ): Promise<UserBook | null> {
    try {
      const userData = {
        bookId,
        status,
        rating,
        notes
      };
      
      const response = await axiosInstance.post('/user-books', userData);
      return response.data;
    } catch (error) {
      console.error('Error adding user book:', error);
      return null;
    }
  },
  
  // Update a user book
  async updateUserBook(
    id: string,
    data: { status?: BookStatus; rating?: number; notes?: string }
  ): Promise<UserBook | null> {
    try {
      const response = await axiosInstance.patch(`/user-books/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user book ${id}:`, error);
      return null;
    }
  },
  
  // Remove a book from user's collection
  async removeUserBook(id: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/user-books/${id}`);
      return true;
    } catch (error) {
      console.error(`Error removing user book ${id}:`, error);
      return false;
    }
  },
  
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axiosInstance.get('/user-books/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalBooksRead: 0,
        currentlyReading: 0,
        wantToRead: 0
      };
    }
  },
  
  // Get the last book the user was reading
  async getLastReadingBook(): Promise<UserBook | null> {
    try {
      const response = await axiosInstance.get('/user-books/last-reading');
      return response.data;
    } catch (error) {
      console.error('Error fetching last reading book:', error);
      return null;
    }
  }
}; 