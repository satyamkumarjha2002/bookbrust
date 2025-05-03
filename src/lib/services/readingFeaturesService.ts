import { v4 as uuidv4 } from 'uuid';
import { 
  ReadingChallenge, 
  ReadingSession, 
  ReadingInsight, 
  BookRecommendation, 
  ReadingReminder,
  BookNote
} from '@/types/reading-features';
import { Book, BookStatus } from '@/types';
import { bookService, userBookService } from './index';

// Helper functions for localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// Keys for localStorage
const KEYS = {
  CHALLENGES: 'bookbrust_challenges',
  SESSIONS: 'bookbrust_reading_sessions',
  REMINDERS: 'bookbrust_reminders',
  NOTES: 'bookbrust_notes'
};

// Reading Challenges
export const challengeService = {
  getChallenges: (): ReadingChallenge[] => {
    return getItem<ReadingChallenge[]>(KEYS.CHALLENGES, []);
  },
  
  getCurrentChallenge: (): ReadingChallenge | null => {
    const challenges = getItem<ReadingChallenge[]>(KEYS.CHALLENGES, []);
    const currentYear = new Date().getFullYear();
    return challenges.find(c => c.year === currentYear) || null;
  },
  
  createChallenge: (targetBooks: number): ReadingChallenge => {
    const challenges = getItem<ReadingChallenge[]>(KEYS.CHALLENGES, []);
    const currentYear = new Date().getFullYear();
    
    // Check if there's already a challenge for this year
    if (challenges.some(c => c.year === currentYear)) {
      throw new Error('A reading challenge already exists for this year');
    }
    
    const newChallenge: ReadingChallenge = {
      id: uuidv4(),
      userId: 'current-user', // In a real app, get from auth
      year: currentYear,
      targetBooks,
      startDate: new Date(currentYear, 0, 1).toISOString(), // Jan 1
      endDate: new Date(currentYear, 11, 31).toISOString(), // Dec 31
      completed: false,
      booksRead: 0
    };
    
    challenges.push(newChallenge);
    setItem(KEYS.CHALLENGES, challenges);
    return newChallenge;
  },
  
  updateChallenge: (challenge: ReadingChallenge): ReadingChallenge => {
    const challenges = getItem<ReadingChallenge[]>(KEYS.CHALLENGES, []);
    const index = challenges.findIndex(c => c.id === challenge.id);
    
    if (index === -1) {
      throw new Error('Challenge not found');
    }
    
    challenges[index] = challenge;
    setItem(KEYS.CHALLENGES, challenges);
    return challenge;
  },
  
  deleteChallenge: (challengeId: string): void => {
    const challenges = getItem<ReadingChallenge[]>(KEYS.CHALLENGES, []);
    const filtered = challenges.filter(c => c.id !== challengeId);
    setItem(KEYS.CHALLENGES, filtered);
  },
  
  updateProgress: (): void => {
    const challenge = challengeService.getCurrentChallenge();
    if (!challenge) return;
    
    // Count books read in the challenge year
    const userBooks = userBookService.getUserBooks();
    const finishedBooks = userBooks.filter(book => 
      book.status === BookStatus.FINISHED &&
      new Date(book.dateUpdated).getFullYear() === challenge.year
    );
    
    // Update the challenge with current progress
    challenge.booksRead = finishedBooks.length;
    challenge.completed = challenge.booksRead >= challenge.targetBooks;
    
    challengeService.updateChallenge(challenge);
  }
};

// Reading Timer
export const timerService = {
  getSessions: (): ReadingSession[] => {
    return getItem<ReadingSession[]>(KEYS.SESSIONS, []);
  },
  
  getSessionsForBook: (bookId: string): ReadingSession[] => {
    const sessions = getItem<ReadingSession[]>(KEYS.SESSIONS, []);
    return sessions.filter(session => session.bookId === bookId);
  },
  
  startSession: (bookId: string): ReadingSession => {
    const sessions = getItem<ReadingSession[]>(KEYS.SESSIONS, []);
    
    // Check if there's an open session
    const openSession = sessions.find(s => !s.endTime);
    if (openSession) {
      throw new Error('There is already an active reading session');
    }
    
    const newSession: ReadingSession = {
      id: uuidv4(),
      userId: 'current-user', // In a real app, get from auth
      bookId,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0
    };
    
    sessions.push(newSession);
    setItem(KEYS.SESSIONS, sessions);
    return newSession;
  },
  
  endSession: (sessionId: string, pagesRead?: number): ReadingSession => {
    const sessions = getItem<ReadingSession[]>(KEYS.SESSIONS, []);
    const index = sessions.findIndex(s => s.id === sessionId);
    
    if (index === -1) {
      throw new Error('Session not found');
    }
    
    const session = sessions[index];
    const endTime = new Date().toISOString();
    const durationMs = new Date(endTime).getTime() - new Date(session.startTime).getTime();
    const durationSec = Math.floor(durationMs / 1000);
    
    sessions[index] = {
      ...session,
      endTime,
      duration: durationSec,
      pagesRead
    };
    
    setItem(KEYS.SESSIONS, sessions);
    return sessions[index];
  },
  
  getCurrentSession: (): ReadingSession | null => {
    const sessions = getItem<ReadingSession[]>(KEYS.SESSIONS, []);
    return sessions.find(s => !s.endTime) || null;
  },
  
  getTotalReadingTime: (bookId?: string): number => {
    const sessions = getItem<ReadingSession[]>(KEYS.SESSIONS, []);
    const filteredSessions = bookId 
      ? sessions.filter(s => s.bookId === bookId)
      : sessions;
      
    return filteredSessions.reduce((total, session) => total + session.duration, 0);
  }
};

// Reading Insights
export const insightService = {
  getInsights: (): ReadingInsight => {
    const sessions = timerService.getSessions();
    const completedSessions = sessions.filter(s => s.endTime);
    
    // Total reading time
    const totalReadingTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Average session length
    const averageSessionLength = completedSessions.length > 0 
      ? totalReadingTime / completedSessions.length 
      : 0;
    
    // Reading streak (consecutive days)
    const readingDates = new Set<string>();
    completedSessions.forEach(s => {
      const date = new Date(s.startTime).toISOString().split('T')[0];
      readingDates.add(date);
    });
    
    const sortedDates = Array.from(readingDates).sort();
    let streak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const current = new Date(sortedDates[i]);
        const prev = new Date(sortedDates[i-1]);
        
        // Add one day to prev
        prev.setDate(prev.getDate() + 1);
        
        if (current.toISOString().split('T')[0] === prev.toISOString().split('T')[0]) {
          // Consecutive day
          currentStreak++;
        } else {
          // Streak broken
          streak = Math.max(streak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    
    streak = Math.max(streak, currentStreak);
    
    // Most productive time of day
    const timeSlots: Record<string, number> = {
      morning: 0, // 5-12
      afternoon: 0, // 12-17
      evening: 0, // 17-21
      night: 0 // 21-5
    };
    
    completedSessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      
      if (hour >= 5 && hour < 12) timeSlots.morning += s.duration;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon += s.duration;
      else if (hour >= 17 && hour < 21) timeSlots.evening += s.duration;
      else timeSlots.night += s.duration;
    });
    
    let mostProductiveTimeOfDay: string | undefined;
    let maxTime = 0;
    
    for (const [timeSlot, time] of Object.entries(timeSlots)) {
      if (time > maxTime) {
        maxTime = time;
        mostProductiveTimeOfDay = timeSlot;
      }
    }
    
    // Reading speed
    const totalPages = completedSessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    const totalHours = totalReadingTime / 3600;
    const readingSpeed = totalHours > 0 ? totalPages / totalHours : 0;
    
    return {
      totalReadingTime,
      averageSessionLength,
      readingStreak: streak,
      mostProductiveTimeOfDay,
      readingSpeed: readingSpeed > 0 ? readingSpeed : undefined
    };
  }
};

// Book Recommendations
export const recommendationService = {
  getRecommendations: (): BookRecommendation[] => {
    const userBooks = userBookService.getUserBooks();
    const allBooks = bookService.getAllBooks();
    
    // Books the user hasn't added yet
    const userBookIds = new Set(userBooks.map(ub => ub.bookId));
    const unreadBooks = allBooks.filter((book: Book) => !userBookIds.has(book.id));
    
    if (unreadBooks.length === 0) return [];
    
    // Find favorite authors based on ratings
    const authorRatings: Record<string, { sum: number, count: number }> = {};
    
    userBooks.forEach(userBook => {
      if (userBook.rating) {
        const book = bookService.getBookById(userBook.bookId);
        if (book) {
          const author = book.author;
          if (!authorRatings[author]) {
            authorRatings[author] = { sum: 0, count: 0 };
          }
          authorRatings[author].sum += userBook.rating;
          authorRatings[author].count += 1;
        }
      }
    });
    
    // Calculate average rating by author
    const authorAvgRatings: Record<string, number> = {};
    for (const [author, data] of Object.entries(authorRatings)) {
      authorAvgRatings[author] = data.sum / data.count;
    }
    
    // Generate recommendations
    const recommendations: BookRecommendation[] = [];
    
    unreadBooks.forEach((book: Book) => {
      let score = 50; // Base score
      let reason = '';
      
      // Boost score for books by favorite authors
      const authorRating = authorAvgRatings[book.author];
      if (authorRating) {
        const boost = Math.round((authorRating - 3) * 15); // -30 to +30 boost based on rating
        score += boost;
        
        if (authorRating >= 4) {
          reason = `You've highly rated books by ${book.author}`;
        } else if (authorRating >= 3) {
          reason = `You've positively rated other books by ${book.author}`;
        }
      } else {
        reason = 'Discover a new author';
      }
      
      // Cap the score
      score = Math.max(0, Math.min(100, score));
      
      recommendations.push({
        bookId: book.id,
        book,
        score,
        reason
      });
    });
    
    // Sort by score (highest first)
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 recommendations
  }
};

// Reading Reminders
export const reminderService = {
  getReminders: (): ReadingReminder[] => {
    return getItem<ReadingReminder[]>(KEYS.REMINDERS, []);
  },
  
  createReminder: (
    days: boolean[], 
    time: string, 
    message: string = "Time to read!"
  ): ReadingReminder => {
    const reminders = getItem<ReadingReminder[]>(KEYS.REMINDERS, []);
    
    const newReminder: ReadingReminder = {
      id: uuidv4(),
      userId: 'current-user', // In a real app, get from auth
      days,
      time,
      message,
      isActive: true
    };
    
    reminders.push(newReminder);
    setItem(KEYS.REMINDERS, reminders);
    return newReminder;
  },
  
  updateReminder: (reminder: ReadingReminder): ReadingReminder => {
    const reminders = getItem<ReadingReminder[]>(KEYS.REMINDERS, []);
    const index = reminders.findIndex(r => r.id === reminder.id);
    
    if (index === -1) {
      throw new Error('Reminder not found');
    }
    
    reminders[index] = reminder;
    setItem(KEYS.REMINDERS, reminders);
    return reminder;
  },
  
  deleteReminder: (reminderId: string): void => {
    const reminders = getItem<ReadingReminder[]>(KEYS.REMINDERS, []);
    const filtered = reminders.filter(r => r.id !== reminderId);
    setItem(KEYS.REMINDERS, filtered);
  },
  
  toggleReminder: (reminderId: string): ReadingReminder => {
    const reminders = getItem<ReadingReminder[]>(KEYS.REMINDERS, []);
    const index = reminders.findIndex(r => r.id === reminderId);
    
    if (index === -1) {
      throw new Error('Reminder not found');
    }
    
    reminders[index] = {
      ...reminders[index],
      isActive: !reminders[index].isActive
    };
    
    setItem(KEYS.REMINDERS, reminders);
    return reminders[index];
  }
};

// Book Notes & Highlights
export const noteService = {
  getNotes: (): BookNote[] => {
    return getItem<BookNote[]>(KEYS.NOTES, []);
  },
  
  getNotesForBook: (bookId: string): BookNote[] => {
    const notes = getItem<BookNote[]>(KEYS.NOTES, []);
    return notes.filter(note => note.bookId === bookId);
  },
  
  createNote: (
    bookId: string, 
    content: string, 
    isHighlight: boolean = false,
    page?: number,
    chapter?: string,
    color?: string
  ): BookNote => {
    const notes = getItem<BookNote[]>(KEYS.NOTES, []);
    
    const newNote: BookNote = {
      id: uuidv4(),
      userId: 'current-user', // In a real app, get from auth
      bookId,
      content,
      isHighlight,
      page,
      chapter,
      color: isHighlight ? (color || 'yellow') : undefined,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    };
    
    notes.push(newNote);
    setItem(KEYS.NOTES, notes);
    return newNote;
  },
  
  updateNote: (note: BookNote): BookNote => {
    const notes = getItem<BookNote[]>(KEYS.NOTES, []);
    const index = notes.findIndex(n => n.id === note.id);
    
    if (index === -1) {
      throw new Error('Note not found');
    }
    
    note.dateUpdated = new Date().toISOString();
    notes[index] = note;
    setItem(KEYS.NOTES, notes);
    return note;
  },
  
  deleteNote: (noteId: string): void => {
    const notes = getItem<BookNote[]>(KEYS.NOTES, []);
    const filtered = notes.filter(n => n.id !== noteId);
    setItem(KEYS.NOTES, filtered);
  }
};

// Export all services
export const readingFeaturesService = {
  challenges: challengeService,
  timer: timerService,
  insights: insightService,
  recommendations: recommendationService,
  reminders: reminderService,
  notes: noteService
}; 