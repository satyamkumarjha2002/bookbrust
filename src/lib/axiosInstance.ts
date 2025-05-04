// @ts-nocheck - This file needs axios types
import axios from "axios";
import LocalStorageService from "./localStorage";
import Cookies from 'js-cookie';
import { API_CONFIG } from './config';

// Set up base URL for API calls - ensure it's correct and being used
console.log("Creating axios instance with base URL:", API_CONFIG.API_URL);

// Create a function to get the branch ID, safely checking for window existence
const getBranchId = () => {
  if (typeof window !== 'undefined') {
    return LocalStorageService.get<number>("branchId");
  }
  return undefined;
};

// Create the axios instance with proper headers
const axiosInstance = axios.create({
  baseURL: API_CONFIG.API_URL, // This must match the API server's address
  headers: {
    "Content-Type": "application/json",
    "branchId": getBranchId(),
  },
  timeout: 10000, // Add a timeout so requests don't hang indefinitely
  withCredentials: false, // Set to false for development to avoid CORS issues
});

// Add request debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    const token = Cookies.get(API_CONFIG.TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached to request");
    } else {
      console.log("No auth token found");
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle token expiration or unauthorized access
    console.error("API Response Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received, likely a network error or CORS issue");
    }
    
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      console.log("Unauthorized access, redirecting to login");
      Cookies.remove(API_CONFIG.TOKEN_KEY);
      if (typeof window !== 'undefined') {
        LocalStorageService.remove("loggedInUser");
        LocalStorageService.remove("branchId");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  Cookies.set(API_CONFIG.TOKEN_KEY, token, { expires: API_CONFIG.TOKEN_EXPIRES });
};

export const clearAuthToken = () => {
  Cookies.remove(API_CONFIG.TOKEN_KEY);
};

export const getAuthToken = () => {
  return Cookies.get(API_CONFIG.TOKEN_KEY);
};

export default axiosInstance;
