import { apiAuthService } from './services/apiAuthService';
import { apiBookService } from './services/apiBookService';
import { apiUserBookService } from './services/apiUserBookService';
import { apiReviewService } from './services/apiReviewService';
import { apiNotesService } from './services/apiNotesService';
import { apiRecommendationsService } from './services/apiRecommendationsService';
import { 
  challengeService,
  timerService,
  insightService,
  reminderService
} from './services/readingFeaturesService';

// Export all services directly
export const authService = apiAuthService;
export const bookService = apiBookService;
export const userBookService = apiUserBookService;
export const reviewService = apiReviewService;
export const notesService = apiNotesService;
export const recommendationsService = apiRecommendationsService;

// Export reading features services
export const readingFeaturesService = {
  challengeService,
  timerService,
  insightService,
  // Use API services for notes and recommendations
  recommendationsService: apiRecommendationsService,
  notesService: apiNotesService,
  reminderService
};

// This file centralizes all service exports to make it easier to switch implementations 