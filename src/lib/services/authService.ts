import { User } from '@/types';
import LocalStorageService from '../localStorage';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

const AUTH_KEY = 'bookbrust_auth';
const USERS_KEY = 'bookbrust_users';
const COOKIE_EXPIRES = 7; // Expire in 7 days

// Safe check for browser environment
const isBrowser = typeof window !== 'undefined';

export const authService = {
  // Register a new user
  register: (email: string, password: string): User | null => {
    try {
      if (!isBrowser) return null;
      
      // Get existing users
      const users = LocalStorageService.get<Record<string, { email: string; password: string }>>(USERS_KEY) || {};
      
      // Check if user already exists
      if (users[email]) {
        throw new Error('User already exists');
      }
      
      // Create a new user
      const userId = uuidv4();
      const newUser: User = {
        id: userId,
        email,
      };
      
      // Save user credentials
      users[email] = { email, password };
      LocalStorageService.save(USERS_KEY, users);
      
      // Set current user in auth storage
      LocalStorageService.save(AUTH_KEY, newUser);
      
      // Set auth cookie
      Cookies.set(AUTH_KEY, JSON.stringify(newUser), { expires: COOKIE_EXPIRES });
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },
  
  // Login a user
  login: (email: string, password: string): User | null => {
    try {
      if (!isBrowser) return null;
      
      // Get existing users
      const users = LocalStorageService.get<Record<string, { email: string; password: string }>>(USERS_KEY) || {};
      
      // Check if user exists and password matches
      if (!users[email] || users[email].password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Create user object without password
      const user: User = {
        id: uuidv4(), // Generate proper UUID instead of index
        email,
      };
      
      // Set current user in auth storage
      LocalStorageService.save(AUTH_KEY, user);
      
      // Set auth cookie
      Cookies.set(AUTH_KEY, JSON.stringify(user), { expires: COOKIE_EXPIRES });
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  // Get current authenticated user
  getCurrentUser: (): User | null => {
    try {
      if (!isBrowser) return null;
      
      // Try to get from cookie first
      const userCookie = Cookies.get(AUTH_KEY);
      if (userCookie) {
        return JSON.parse(userCookie);
      }
      
      // Fall back to localStorage
      const user = LocalStorageService.get<User>(AUTH_KEY);
      
      // If user exists in localStorage but not in cookies, set the cookie
      if (user) {
        Cookies.set(AUTH_KEY, JSON.stringify(user), { expires: COOKIE_EXPIRES });
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Logout current user
  logout: (): void => {
    if (!isBrowser) return;
    
    LocalStorageService.remove(AUTH_KEY);
    Cookies.remove(AUTH_KEY);
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },
  
  // Update user profile
  updateProfile: (userData: Partial<User>): User | null => {
    if (!isBrowser) return null;
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    const updatedUser = { ...currentUser, ...userData };
    LocalStorageService.save(AUTH_KEY, updatedUser);
    Cookies.set(AUTH_KEY, JSON.stringify(updatedUser), { expires: COOKIE_EXPIRES });
    
    return updatedUser;
  }
}; 