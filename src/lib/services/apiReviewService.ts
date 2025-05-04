import axiosInstance from '../axiosInstance';
import { Review } from '@/types/index';

// This service will interact with our backend API for review operations
export const apiReviewService = {
  // Get all public reviews for a book
  async getBookReviews(bookId: string): Promise<Review[]> {
    try {
      const response = await axiosInstance.get(`/reviews/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for book ${bookId}:`, error);
      return [];
    }
  },
  
  // Get all reviews by current user
  async getUserReviews(): Promise<Review[]> {
    try {
      const response = await axiosInstance.get('/reviews/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  },
  
  // Get a specific review by ID
  async getReview(id: string): Promise<Review | null> {
    try {
      const response = await axiosInstance.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching review ${id}:`, error);
      return null;
    }
  },
  
  // Get user's review for a book
  async getUserReviewForBook(bookId: string): Promise<Review | null> {
    try {
      const response = await axiosInstance.get(`/reviews/user/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user review for book ${bookId}:`, error);
      return null;
    }
  },
  
  // Add a new review
  async addReview(
    bookId: string,
    content: string,
    rating: number,
    isPublic: boolean = true
  ): Promise<Review | null> {
    try {
      const reviewData = {
        bookId,
        content,
        rating,
        isPublic
      };
      
      const response = await axiosInstance.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  },
  
  // Update a review
  async updateReview(
    id: string,
    data: { content?: string; rating?: number; isPublic?: boolean }
  ): Promise<Review | null> {
    try {
      const response = await axiosInstance.patch(`/reviews/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating review ${id}:`, error);
      return null;
    }
  },
  
  // Delete a review
  async deleteReview(id: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/reviews/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting review ${id}:`, error);
      return false;
    }
  }
}; 