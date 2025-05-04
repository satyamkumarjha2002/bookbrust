import axiosInstance from '../axiosInstance';
import { Book } from '@/types/index';

// This service will interact with our backend API for book operations
export const apiBookService = {
  // Get all books
  async getAllBooks(): Promise<Book[]> {
    try {
      const response = await axiosInstance.get('/books');
      return response.data as Book[];
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  },
  
  // Get a book by ID
  async getBookById(id: string): Promise<Book | null> {
    try {
      const response = await axiosInstance.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error);
      return null;
    }
  },
  
  // Add a new book
  async addBook(bookData: Omit<Book, 'id'>): Promise<Book | null> {
    try {
      const response = await axiosInstance.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error adding book:', error);
      return null;
    }
  },
  
  // Update a book
  async updateBook(id: string, bookData: Partial<Book>): Promise<Book | null> {
    try {
      const response = await axiosInstance.patch(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book ${id}:`, error);
      return null;
    }
  },
  
  // Delete a book
  async deleteBook(id: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/books/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting book ${id}:`, error);
      return false;
    }
  },
  
  // Search books
  async searchBooks(query: string): Promise<Book[]> {
    try {
      const response = await axiosInstance.get(`/books/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  },
  
  // Get trending books
  async getTrendingBooks(limit: number = 5): Promise<Book[]> {
    try {
      const response = await axiosInstance.get(`/books/trending?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending books:', error);
      return [];
    }
  }
}; 