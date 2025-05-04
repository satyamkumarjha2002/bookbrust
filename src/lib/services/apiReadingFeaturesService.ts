import axiosInstance from '../axiosInstance';
import { 
  ReadingChallenge,
  ReadingSession,
  ReadingInsight,
  BookRecommendation,
  ReadingReminder,
  BookNote
} from '@/types/reading-features';

// API implementation of challenge service
const apiChallengeService = {
  // Get all reading challenges
  async getChallenges(): Promise<ReadingChallenge[]> {
    try {
      const response = await axiosInstance.get('/reading-challenges');
      return response.data;
    } catch (error) {
      console.error('Error fetching reading challenges:', error);
      return [];
    }
  },
  
  // Get current challenge
  async getCurrentChallenge(): Promise<ReadingChallenge | null> {
    try {
      const response = await axiosInstance.get('/reading-challenges/current');
      return response.data || null;
    } catch (error) {
      console.error('Error fetching current challenge:', error);
      return null;
    }
  },
  
  // Create a new challenge
  async createChallenge(targetBooks: number): Promise<ReadingChallenge | null> {
    try {
      const response = await axiosInstance.post('/reading-challenges', { targetBooks });
      return response.data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      return null;
    }
  },
  
  // Update a challenge
  async updateChallenge(challenge: ReadingChallenge): Promise<ReadingChallenge | null> {
    try {
      const response = await axiosInstance.patch(`/reading-challenges/${challenge.id}`, challenge);
      return response.data;
    } catch (error) {
      console.error(`Error updating challenge ${challenge.id}:`, error);
      return null;
    }
  },
  
  // Delete a challenge
  async deleteChallenge(challengeId: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/reading-challenges/${challengeId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting challenge ${challengeId}:`, error);
      return false;
    }
  },
  
  // Update progress for current challenge
  async updateProgress(finishedBooks: number): Promise<boolean> {
    try {
      await axiosInstance.post('/reading-challenges/progress', { finishedBooks });
      return true;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return false;
    }
  }
};

// API implementation of timer service
const apiTimerService = {
  // Get all reading sessions
  async getSessions(): Promise<ReadingSession[]> {
    try {
      const response = await axiosInstance.get('/reading-sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching reading sessions:', error);
      return [];
    }
  },
  
  // Get sessions for a book
  async getSessionsForBook(bookId: string): Promise<ReadingSession[]> {
    try {
      const response = await axiosInstance.get(`/reading-sessions/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for book ${bookId}:`, error);
      return [];
    }
  },
  
  // Start a reading session
  async startSession(bookId: string): Promise<ReadingSession | null> {
    try {
      const response = await axiosInstance.post('/reading-sessions/start', { bookId });
      return response.data;
    } catch (error) {
      console.error('Error starting reading session:', error);
      return null;
    }
  },
  
  // End a reading session
  async endSession(sessionId: string, pagesRead?: number): Promise<ReadingSession | null> {
    try {
      const response = await axiosInstance.post(`/reading-sessions/${sessionId}/end`, { pagesRead });
      return response.data;
    } catch (error) {
      console.error(`Error ending session ${sessionId}:`, error);
      return null;
    }
  },
  
  // Get current active session
  async getCurrentSession(): Promise<ReadingSession | null> {
    try {
      const response = await axiosInstance.get('/reading-sessions/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current session:', error);
      return null;
    }
  },
  
  // Get total reading time
  async getTotalReadingTime(bookId?: string): Promise<number> {
    try {
      const url = bookId 
        ? `/reading-sessions/total-time?bookId=${bookId}` 
        : '/reading-sessions/total-time';
      const response = await axiosInstance.get(url);
      return response.data.totalTime;
    } catch (error) {
      console.error('Error fetching total reading time:', error);
      return 0;
    }
  }
};

// API implementation of insights service
const apiInsightService = {
  // Get reading insights
  async getInsights(): Promise<ReadingInsight> {
    try {
      const response = await axiosInstance.get('/reading-insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching reading insights:', error);
      return {
        totalReadingTime: 0,
        averageSessionLength: 0,
        readingStreak: 0,
        mostProductiveTimeOfDay: 'none'
      };
    }
  }
};

// API implementation of recommendations service
const apiRecommendationService = {
  // Get book recommendations
  async getRecommendations(): Promise<BookRecommendation[]> {
    try {
      const response = await axiosInstance.get('/book-recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching book recommendations:', error);
      return [];
    }
  }
};

// API implementation of reminders service
const apiReminderService = {
  // Get reading reminders
  async getReminders(): Promise<ReadingReminder[]> {
    try {
      const response = await axiosInstance.get('/reading-reminders');
      return response.data;
    } catch (error) {
      console.error('Error fetching reading reminders:', error);
      return [];
    }
  },
  
  // Create a reminder
  async createReminder(
    days: boolean[], 
    time: string, 
    message: string = "Time to read!"
  ): Promise<ReadingReminder | null> {
    try {
      const response = await axiosInstance.post('/reading-reminders', { days, time, message });
      return response.data;
    } catch (error) {
      console.error('Error creating reading reminder:', error);
      return null;
    }
  },
  
  // Update a reminder
  async updateReminder(reminder: ReadingReminder): Promise<ReadingReminder | null> {
    try {
      const response = await axiosInstance.patch(`/reading-reminders/${reminder.id}`, reminder);
      return response.data;
    } catch (error) {
      console.error(`Error updating reminder ${reminder.id}:`, error);
      return null;
    }
  },
  
  // Delete a reminder
  async deleteReminder(reminderId: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/reading-reminders/${reminderId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting reminder ${reminderId}:`, error);
      return false;
    }
  },
  
  // Toggle a reminder
  async toggleReminder(reminderId: string): Promise<ReadingReminder | null> {
    try {
      const response = await axiosInstance.post(`/reading-reminders/${reminderId}/toggle`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling reminder ${reminderId}:`, error);
      return null;
    }
  }
};

// API implementation of notes service
const apiNoteService = {
  // Get all notes
  async getNotes(): Promise<BookNote[]> {
    try {
      const response = await axiosInstance.get('/book-notes');
      return response.data;
    } catch (error) {
      console.error('Error fetching book notes:', error);
      return [];
    }
  },
  
  // Get notes for a book
  async getNotesForBook(bookId: string): Promise<BookNote[]> {
    try {
      const response = await axiosInstance.get(`/book-notes/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notes for book ${bookId}:`, error);
      return [];
    }
  },
  
  // Create a note
  async createNote(
    bookId: string, 
    content: string, 
    isHighlight: boolean = false,
    page?: number,
    chapter?: string,
    color?: string
  ): Promise<BookNote | null> {
    try {
      const noteData = {
        bookId,
        content,
        isHighlight,
        page,
        chapter,
        color: isHighlight ? (color || 'yellow') : undefined
      };
      
      const response = await axiosInstance.post('/book-notes', noteData);
      return response.data;
    } catch (error) {
      console.error('Error creating book note:', error);
      return null;
    }
  },
  
  // Update a note - signature matches localStorage implementation
  async updateNote(
    noteId: string, 
    content: string, 
    page?: number
  ): Promise<BookNote | null> {
    try {
      const response = await axiosInstance.patch(`/book-notes/${noteId}`, { 
        content, 
        page,
        dateUpdated: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating note ${noteId}:`, error);
      return null;
    }
  },
  
  // Delete a note
  async deleteNote(noteId: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`/book-notes/${noteId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting note ${noteId}:`, error);
      return false;
    }
  }
};

// Export all API services
export const apiReadingFeaturesService = {
  challenges: apiChallengeService,
  timer: apiTimerService,
  insights: apiInsightService,
  recommendations: apiRecommendationService,
  reminders: apiReminderService,
  notes: apiNoteService
}; 