// Export managed services directly to simplify code migration
import { 
  managedAuthService,
  managedBookService,
  managedUserBookService,
  managedReviewService,
  managedReadingFeaturesService,
  serviceManager
} from './serviceManager';

// Export services with their original names to avoid changing imports
export const authService = managedAuthService;
export const bookService = managedBookService;
export const userBookService = managedUserBookService;
export const reviewService = managedReviewService;
export const readingFeaturesService = managedReadingFeaturesService;

// Export the service manager for direct access
export { serviceManager };

// API Services (for direct access if needed)
export { apiAuthService } from './apiAuthService';
export { apiBookService } from './apiBookService';
export { apiUserBookService } from './apiUserBookService';
export { apiReviewService } from './apiReviewService';

// Service Manager and managed services (preferred way to access services)
export { 
  managedAuthService as authServiceManager,
  managedBookService as bookServiceManager,
  managedUserBookService as userBookServiceManager,
  managedReviewService as reviewServiceManager,
  managedReadingFeaturesService as readingFeaturesServiceManager
} from './serviceManager'; 