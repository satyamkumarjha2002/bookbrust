// mock-api-server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 9090;

// Very permissive CORS for development
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[MOCK-API] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Basic data store
const challenges = [];
const sessions = [];
const reminders = [];
const notes = [];
const books = [
  {
    id: 'book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
    description: 'A classic novel about the American Dream',
    publishedDate: '1925-04-10',
    genre: 'Fiction'
  },
  {
    id: 'book-2',
    title: '1984',
    author: 'George Orwell',
    coverUrl: 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg',
    description: 'A dystopian novel about totalitarianism',
    publishedDate: '1949-06-08',
    genre: 'Science Fiction'
  },
  {
    id: 'book-3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverUrl: 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg',
    description: 'A novel about racial injustice in the American South',
    publishedDate: '1960-07-11',
    genre: 'Fiction'
  }
];
const userBooks = [
  {
    id: 'user-book-1',
    bookId: 'book-1',
    status: 'Reading',
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString()
  }
];

// Health check endpoint
app.get('/health-check', (req, res) => {
  console.log('[MOCK-API] Health check endpoint called');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Mock API server is running',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BookBrust Mock API Server',
    endpoints: [
      '/health-check',
      '/reading-challenges',
      '/reading-challenges/current',
      '/reading-sessions',
      '/book-notes',
      '/books',
      '/books/trending',
      '/user-books',
      '/user-books/dashboard-stats',
      '/auth/login',
      '/auth/register',
      '/auth/me'
    ]
  });
});

// Books API
app.get('/books/trending', (req, res) => {
  // Return some books as trending
  const limit = parseInt(req.query.limit) || 5;
  res.json(books.slice(0, limit));
});

app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find(b => b.id === id);
  
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  res.json(book);
});

app.get('/books', (req, res) => {
  res.json(books);
});

// User Books API
app.get('/user-books', (req, res) => {
  res.json(userBooks);
});

app.get('/user-books/dashboard-stats', (req, res) => {
  // Calculate dashboard stats from userBooks
  const stats = {
    totalBooksRead: userBooks.filter(ub => ub.status === 'Read').length,
    currentlyReading: userBooks.filter(ub => ub.status === 'Reading').length,
    wantToRead: userBooks.filter(ub => ub.status === 'WantToRead').length
  };
  
  res.json(stats);
});

app.get('/user-books/last-reading', (req, res) => {
  // Find the most recently updated book with 'Reading' status
  const readingBooks = userBooks.filter(ub => ub.status === 'Reading');
  if (readingBooks.length === 0) {
    return res.json(null);
  }
  
  // Sort by dateUpdated (most recent first)
  readingBooks.sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime());
  
  res.json(readingBooks[0]);
});

// Reading Challenges API
app.get('/reading-challenges', (req, res) => {
  res.json(challenges);
});

app.get('/reading-challenges/current', (req, res) => {
  const currentYear = new Date().getFullYear();
  const currentChallenge = challenges.find(c => c.year === currentYear);
  res.json(currentChallenge || null);
});

app.post('/reading-challenges', (req, res) => {
  const { targetBooks } = req.body;
  const currentYear = new Date().getFullYear();
  
  // Check if a challenge already exists for this year
  if (challenges.some(c => c.year === currentYear)) {
    return res.status(400).json({ error: 'A reading challenge already exists for this year' });
  }
  
  const newChallenge = {
    id: Date.now().toString(),
    userId: 'mock-user',
    year: currentYear,
    targetBooks,
    startDate: new Date(currentYear, 0, 1).toISOString(),
    endDate: new Date(currentYear, 11, 31).toISOString(),
    completed: false,
    booksRead: 0
  };
  
  challenges.push(newChallenge);
  res.status(201).json(newChallenge);
});

app.patch('/reading-challenges/:id', (req, res) => {
  const { id } = req.params;
  const index = challenges.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  const updatedChallenge = { ...challenges[index], ...req.body };
  challenges[index] = updatedChallenge;
  res.json(updatedChallenge);
});

app.delete('/reading-challenges/:id', (req, res) => {
  const { id } = req.params;
  const index = challenges.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  challenges.splice(index, 1);
  res.status(204).send();
});

app.post('/reading-challenges/progress', (req, res) => {
  const { finishedBooks } = req.body;
  const currentYear = new Date().getFullYear();
  const index = challenges.findIndex(c => c.year === currentYear);
  
  if (index === -1) {
    return res.status(404).json({ error: 'No current challenge found' });
  }
  
  challenges[index].booksRead = finishedBooks;
  challenges[index].completed = finishedBooks >= challenges[index].targetBooks;
  
  res.json({ success: true });
});

// Reading Sessions API
app.get('/reading-sessions', (req, res) => {
  res.json(sessions);
});

app.get('/reading-sessions/book/:bookId', (req, res) => {
  const { bookId } = req.params;
  const bookSessions = sessions.filter(s => s.bookId === bookId);
  res.json(bookSessions);
});

// Book Notes API
app.get('/book-notes', (req, res) => {
  res.json(notes);
});

app.get('/book-notes/book/:bookId', (req, res) => {
  const { bookId } = req.params;
  const bookNotes = notes.filter(n => n.bookId === bookId);
  res.json(bookNotes);
});

app.post('/book-notes', (req, res) => {
  const { bookId, content, isHighlight, page, chapter, color } = req.body;
  
  const newNote = {
    id: Date.now().toString(),
    userId: 'mock-user',
    bookId,
    content,
    isHighlight: isHighlight || false,
    page,
    chapter,
    color: isHighlight ? (color || 'yellow') : undefined,
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString()
  };
  
  notes.push(newNote);
  res.status(201).json(newNote);
});

app.patch('/book-notes/:id', (req, res) => {
  const { id } = req.params;
  const { content, page } = req.body;
  const index = notes.findIndex(n => n.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  notes[index] = {
    ...notes[index],
    content,
    page,
    dateUpdated: new Date().toISOString()
  };
  
  res.json(notes[index]);
});

app.delete('/book-notes/:id', (req, res) => {
  const { id } = req.params;
  const index = notes.findIndex(n => n.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  notes.splice(index, 1);
  res.status(204).send();
});

// Auth API
app.post('/auth/login', (req, res) => {
  // Always return success with mock user and token
  res.json({
    token: 'mock-auth-token',
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com'
    }
  });
});

app.post('/auth/register', (req, res) => {
  // Always return success with mock user and token
  res.json({
    token: 'mock-auth-token',
    user: {
      id: 'user-1',
      name: req.body.name || 'New User',
      email: req.body.email
    }
  });
});

app.get('/auth/me', (req, res) => {
  // Return mock user data
  res.json({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
}); 