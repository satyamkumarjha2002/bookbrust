import { Review } from '@/types';
import LocalStorageService from '../localStorage';
import { v4 as uuidv4 } from 'uuid';
import { authService } from './authService';

const REVIEWS_KEY = 'bookbrust_reviews';

export const reviewService = {
  // Get all public reviews for a book
  getBookReviews: (bookId: string): Review[] => {
    const reviews = LocalStorageService.get<Record<string, Review>>(REVIEWS_KEY) || {};
    return Object.values(reviews)
      .filter(review => review.bookId === bookId && review.isPublic)
      .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  },
  
  // Get all reviews by current user
  getUserReviews: (): Review[] => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];
    
    const reviews = LocalStorageService.get<Record<string, Review>>(REVIEWS_KEY) || {};
    return Object.values(reviews)
      .filter(review => review.userId === currentUser.id)
      .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  },
  
  // Get a specific review by ID
  getReview: (id: string): Review | null => {
    const reviews = LocalStorageService.get<Record<string, Review>>(REVIEWS_KEY) || {};
    return reviews[id] || null;
  },
  
  // Get user's review for a book
  getUserReviewForBook: (bookId: string): Review | null => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    const reviews = LocalStorageService.get<Record<string, Review>>(REVIEWS_KEY) || {};
    const foundReview = Object.values(reviews).find(
      review => review.bookId === bookId && review.userId === currentUser.id
    );
    
    return foundReview || null;
  },
  
  // Add a new review
  addReview: (
    bookId: string, 
    content: string, 
    rating: number, 
    isPublic: boolean = true
  ): Review | null => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;
    
    const reviews = LocalStorageService.get<Record<string, Review>>(REVIEWS_KEY) || {};
    
    // Check if user already has a review for this book
    const existingReview = Object.values(reviews).find(
      review => review.bookId === bookId && review.userId === currentUser.id
    );
    
    if (existingReview) {
      // Update existing review
      return reviewService.updateReview(existingReview.id, { content, rating, isPublic });
    }
    
    // Create a new review
    const now = new Date().toISOString();
    const newReview: Review = {
      id: uuidv4(),
      userId: currentUser.id,
      bookId,
      content,
      rating,
      isPublic,
      dateCreated: now,
      dateUpdated: now
    };
    
    reviews[newReview.id] = newReview;
    LocalStorageService.save(REVIEWS_KEY, reviews);
    
    return newReview;
  },
  
  // Update a review
  updateReview: (id: string, data: Partial<Review>): Review | null => {
    const reviews = LocalStorageService.get<Record<string, Review>>(REVIEWS_KEY) || {};
    const currentUser = authService.getCurrentUser();
    
    if (!reviews[id] || !currentUser || reviews[id].userId !== currentUser.id) return null;
    
    const updatedReview = { 
      ...reviews[id], 
      ...data, 
      dateUpdated: new Date().toISOString() 
    };
    
    reviews[id] = updatedReview;
    LocalStorageService.save(REVIEWS_KEY, reviews);
    
    return updatedReview;
  },
  
  // Delete a review
  deleteReview: (id: string): boolean => {
    const reviews = LocalStorageService.get<Record<string, Review>>(REVIEWS_KEY) || {};
    const currentUser = authService.getCurrentUser();
    
    if (!reviews[id] || !currentUser || reviews[id].userId !== currentUser.id) return false;
    
    delete reviews[id];
    LocalStorageService.save(REVIEWS_KEY, reviews);
    
    return true;
  }
}; 