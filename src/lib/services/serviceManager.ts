// Import API services
import { apiAuthService } from './apiAuthService';
import { apiBookService } from './apiBookService';
import { apiUserBookService } from './apiUserBookService';
import { apiReviewService } from './apiReviewService';
import { apiReadingFeaturesService } from './apiReadingFeaturesService';
import { readingFeaturesService } from './readingFeaturesService';
import { API_CONFIG } from '../config';
import { setAuthToken } from '../axiosInstance';

// Force API mode for testing
const FORCE_API_MODE = true;

// Force authentication for development
if (typeof window !== 'undefined') {
  // Set a mock token for development
  setAuthToken('mock-auth-token-for-development');
  
  // Store a fake user in localStorage for auth persistence
  if (!localStorage.getItem('bookbrust_auth')) {
    localStorage.setItem('bookbrust_auth', JSON.stringify({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com'
    }));
  }
  
  console.log('Development authentication set');
}

// Test the API connection directly
if (typeof window !== 'undefined') {
  // Only run in browser
  const testApiConnection = async () => {
    try {
      console.log('Testing direct API connection at:', API_CONFIG.API_URL);
      const response = await fetch(`${API_CONFIG.API_URL}/health-check`);
      const data = await response.json();
      console.log('API connection test result:', data);
      return true;
    } catch (err) {
      console.error('API connection test failed:', err);
      return false;
    }
  };
  
  // Run the test
  testApiConnection();
}

// Log which implementation we're using
console.log('Service Manager initialized - API Mode:', (FORCE_API_MODE || API_CONFIG.USE_API) ? 'Backend API (FORCED)' : 'localStorage');

// Service manager to handle service access
export const serviceManager = {
  // Get auth service
  getAuthService() {
    return apiAuthService;
  },

  // Get book service
  getBookService() {
    return apiBookService;
  },

  // Get user book service
  getUserBookService() {
    return apiUserBookService;
  },

  // Get review service
  getReviewService() {
    return apiReviewService;
  },

  // Get reading features service based on config
  getReadingFeaturesService() {
    // Force use of API implementation for testing
    const useApi = FORCE_API_MODE || API_CONFIG.USE_API;
    console.log('Getting reading features service, API mode:', useApi, '(FORCED)');
    
    if (useApi) {
      console.log('Using API reading features service');
      return apiReadingFeaturesService;
    } else {
      console.log('Using localStorage reading features service');
      return readingFeaturesService;
    }
  }
};

// Export the managed services for easy access
export const managedAuthService = serviceManager.getAuthService();
export const managedBookService = serviceManager.getBookService();
export const managedUserBookService = serviceManager.getUserBookService();
export const managedReviewService = serviceManager.getReviewService();
export const managedReadingFeaturesService = serviceManager.getReadingFeaturesService(); 