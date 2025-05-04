import axiosInstance, { setAuthToken, clearAuthToken, getAuthToken } from '../axiosInstance';
import { User } from '@/types/index';
import LocalStorageService from '../localStorage';

// Key for storing current user
const AUTH_KEY = 'bookbrust_auth';

// This service will interact with our backend API for authentication
export const apiAuthService = {
  // Register a new user
  async register(email: string, password: string, name?: string): Promise<User | null> {
    try {
      const response = await axiosInstance.post('/auth/register', { email, password, name });
      const { token, user } = response.data;
      
      // Set the JWT token
      setAuthToken(token);
      
      // Store user data in localStorage for auth state persistence
      LocalStorageService.save(AUTH_KEY, user);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },
  
  // Login a user
  async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Set the JWT token
      setAuthToken(token);
      
      // Store user data in localStorage for auth state persistence
      LocalStorageService.save(AUTH_KEY, user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  // Logout the current user
  logout(): void {
    // Clear the JWT token
    clearAuthToken();
    
    // Clear localStorage data
    LocalStorageService.remove(AUTH_KEY);
  },
  
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      // First check if we have a token
      const token = getAuthToken();
      if (!token) return null;
      
      // Call API to get current user
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      // On API failure, try to use the cached user from localStorage
      return LocalStorageService.get<User>(AUTH_KEY);
    }
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Check if we have a token
    return !!getAuthToken();
  },
  
  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User | null> {
    try {
      const response = await axiosInstance.post('/users/profile', userData);
      
      // Update local storage with new user data
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        LocalStorageService.save(AUTH_KEY, updatedUser);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }
}; 