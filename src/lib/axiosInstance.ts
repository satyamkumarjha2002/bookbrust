import axios from "axios";
import LocalStorageService from "./localStorage";

// Set up base URL for API calls
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9090";
// const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://schoolmanagementcore.onrender.com";

console.log("Base URL", baseURL)

// Create a function to get the branch ID, safely checking for window existence
const getBranchId = () => {
  if (typeof window !== 'undefined') {
    return LocalStorageService.get<number>("branchId");
  }
  return undefined;
};

// Create the axios instance with proper headers
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    "branchId": getBranchId(),
  },
  withCredentials: true,
});

// Add response interceptor for handling authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized or 403 Forbidden responses
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear local storage
      if (typeof window !== 'undefined') {
        LocalStorageService.remove("loggedInUser");
        LocalStorageService.remove("branchId");
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
