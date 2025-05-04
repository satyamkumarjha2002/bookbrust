import axiosInstance from '../axiosInstance';
import { BookNote } from '@/types/reading-features';

// This service will interact with our backend API for book notes
export const apiNotesService = {
  // Get all notes for the current user
  async getNotes(): Promise<BookNote[]> {
    try {
      const response = await axiosInstance.get('/notes');
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },
  
  // Get notes for a specific book
  async getNotesForBook(bookId: string): Promise<BookNote[]> {
    try {
      const response = await axiosInstance.get(`/notes/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notes for book ${bookId}:`, error);
      return [];
    }
  },
  
  // Get a specific note by ID
  async getNote(id: string): Promise<BookNote | null> {
    try {
      const response = await axiosInstance.get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error);
      return null;
    }
  },
  
  // Create a new note
  async createNote(
    bookId: string,
    content: string,
    isHighlight: boolean = false,
    page?: number,
    chapter?: string,
    color?: string
  ): Promise<BookNote | null> {
    try {
      const noteData = {
        bookId,
        content,
        isHighlight,
        page,
        chapter,
        color: isHighlight ? (color || 'yellow') : undefined
      };
      
      const response = await axiosInstance.post('/notes', noteData);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  },
  
  // Update a note
  async updateNote(
    id: string,
    data: {
      content?: string;
      isHighlight?: boolean;
      page?: number;
      chapter?: string;
      color?: string;
    }
  ): Promise<BookNote | null> {
    try {
      const response = await axiosInstance.patch(`/notes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating note ${id}:`, error);
      return null;
    }
  },
  
  // Delete a note
  async deleteNote(id: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/notes/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error);
      return false;
    }
  }
}; 