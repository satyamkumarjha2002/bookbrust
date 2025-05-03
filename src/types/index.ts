export enum BookStatus {
  READING = "reading",
  FINISHED = "finished",
  WANT_TO_READ = "wantToRead"
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  description?: string;
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: BookStatus;
  rating?: number; // 1-5 stars
  notes?: string;
  dateAdded: string;
  dateUpdated: string;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  content: string;
  rating: number; // 1-5 stars
  isPublic: boolean;
  dateCreated: string;
  dateUpdated: string;
}

export interface DashboardStats {
  totalBooksRead: number;
  currentlyReading: number;
  wantToRead: number;
} 