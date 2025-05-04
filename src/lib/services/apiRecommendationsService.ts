import axiosInstance from '../axiosInstance';
import { BookRecommendation } from '@/types/reading-features';

// This service will interact with our backend API for book recommendations
export const apiRecommendationsService = {
  // Get personalized book recommendations
  async getRecommendations(limit: number = 5): Promise<BookRecommendation[]> {
    try {
      const response = await axiosInstance.get(`/recommendations?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }
}; 