import { Book, UserBook, BookStatus } from './index';

export interface ReadingChallenge {
  id: string;
  userId: string;
  year: number;
  targetBooks: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  booksRead: number;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  pagesRead?: number;
}

export interface ReadingInsight {
  totalReadingTime: number; // in seconds
  averageSessionLength: number; // in seconds
  readingStreak: number; // consecutive days
  mostReadGenre?: string;
  readingSpeed?: number; // pages per hour
  mostProductiveTimeOfDay?: string; // morning, afternoon, evening, night
}

export interface BookRecommendation {
  bookId: string;
  book: Book;
  score: number; // 0-100 confidence score
  reason: string; // why it's recommended
}

export interface ReadingReminder {
  id: string;
  userId: string;
  days: boolean[]; // array of 7 days, where true means reminder is active
  time: string; // in 24hr format
  message: string;
  isActive: boolean;
}

export interface BookNote {
  id: string;
  userId: string;
  bookId: string;
  page?: number;
  chapter?: string;
  content: string;
  isHighlight: boolean;
  color?: string; // for highlights
  dateCreated: string;
  dateUpdated: string;
} 