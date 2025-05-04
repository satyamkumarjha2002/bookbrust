// API Configuration
export const API_CONFIG = {
  // Whether to use the real API or local storage
  USE_API: process.env.NEXT_PUBLIC_USE_API !== 'false', // Default to true unless explicitly set to false
  
  // API Base URL
  API_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090',
  
  // Authentication token key
  TOKEN_KEY: 'bookbrust_auth_token',
  
  // Token expiration in days
  TOKEN_EXPIRES: 7
}; 

// Log the API configuration on initialization
console.log('API Configuration:', {
  USE_API: API_CONFIG.USE_API,
  API_URL: API_CONFIG.API_URL
}); 