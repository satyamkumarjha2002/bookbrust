import { Book } from '@/types';
import LocalStorageService from './localStorage';
import { v4 as uuidv4 } from 'uuid';

const BOOKS_KEY = 'bookbrust_books';

const seedBooks: Omit<Book, 'id'>[] = [
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    coverUrl: "https://m.media-amazon.com/images/I/710+HcoP38L._SL1500_.jpg",
    description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep."
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    coverUrl: "https://m.media-amazon.com/images/I/71FxgtFKcQL._SL1500_.jpg",
    description: "The story of a young girl confronting the harsh realities of social inequality and racial injustice in the American South."
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    coverUrl: "https://m.media-amazon.com/images/I/71kxa1-0mfL._SL1500_.jpg",
    description: "A dystopian novel set in Airstrip One, a province of the superstate Oceania in a world of perpetual war, omnipresent government surveillance, and public manipulation."
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    coverUrl: "https://m.media-amazon.com/images/I/71FTb9X6wsL._SL1400_.jpg",
    description: "The story of eccentric millionaire Jay Gatsby and his passion for the beautiful Daisy Buchanan during the Roaring Twenties."
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    coverUrl: "https://m.media-amazon.com/images/I/71Q1tPupKjL._SL1360_.jpg",
    description: "A romantic novel following the character development of Elizabeth Bennet, who learns about the repercussions of hasty judgments."
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441172719",
    coverUrl: "https://m.media-amazon.com/images/I/81ym3QUd3KL._SL1500_.jpg",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world."
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "9780062315007",
    coverUrl: "https://m.media-amazon.com/images/I/71zH6w89K3L._SL1500_.jpg",
    description: "A philosophical novel about a young Andalusian shepherd who travels to Egypt after having a recurring dream of finding treasure there."
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    coverUrl: "https://m.media-amazon.com/images/I/713jIoMO3UL._SL1500_.jpg",
    description: "A survey of the history of humankind from the evolution of archaic human species in the Stone Age up to the political and technological revolutions of the 21st century."
  }
];

export function seedBooksData() {
  // Get existing books from localStorage or initialize empty object
  const existingBooks = LocalStorageService.get<Record<string, Book>>(BOOKS_KEY) || {};
  
  // Only seed if no books exist yet
  if (Object.keys(existingBooks).length === 0) {
    const books: Record<string, Book> = {};
    
    // Add each seed book with a unique ID
    seedBooks.forEach(book => {
      const id = uuidv4();
      books[id] = { id, ...book };
    });
    
    // Save to localStorage
    LocalStorageService.save(BOOKS_KEY, books);
    console.log("Seeded books data successfully");
  }
} 