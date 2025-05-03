import { useEffect, useState } from 'react';
import { bookService } from '@/lib/services';
import { Book } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useSeedData() {
  const [isDataSeeded, setIsDataSeeded] = useState(false);
  
  useEffect(() => {
    const seedBooks = () => {
      // Check if we've already seeded books
      const existingBooks = bookService.getAllBooks();
      if (existingBooks.length >= 30) {
        setIsDataSeeded(true);
        return;
      }
      
      // Sample book data to seed - 35+ books of various languages and genres
      const sampleBooks: Omit<Book, 'id'>[] = [
        // English Fiction Books
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          isbn: "9780743273565",
          coverUrl: "https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "The story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island."
        },
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780061120084",
          coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it."
        },
        {
          title: "1984",
          author: "George Orwell",
          isbn: "9780451524935",
          coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A dystopian novel set in a totalitarian regime where government surveillance and thought control are part of everyday life."
        },
        {
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          isbn: "9780316769488",
          coverUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "The story of Holden Caulfield, a teenage boy who has been expelled from prep school and is navigating his way through New York City."
        },
        
        // English Non-Fiction Books
        {
          title: "Sapiens: A Brief History of Humankind",
          author: "Yuval Noah Harari",
          isbn: "9780062316097",
          coverUrl: "https://images.unsplash.com/photo-1561657819-51c0511e35ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A sweeping narrative of humanity's creation and evolution that explores how biology and history have defined us."
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          isbn: "9780735211292",
          coverUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Tiny Changes, Remarkable Results: An Easy & Proven Way to Build Good Habits & Break Bad Ones."
        },
        {
          title: "Thinking, Fast and Slow",
          author: "Daniel Kahneman",
          isbn: "9780374533557",
          coverUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "The book takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think."
        },
        
        // English Fantasy/Sci-Fi
        {
          title: "Harry Potter and the Sorcerer's Stone",
          author: "J.K. Rowling",
          isbn: "9780590353427",
          coverUrl: "https://images.unsplash.com/photo-1626618012641-bfbca5a31239?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility."
        },
        {
          title: "The Lord of the Rings",
          author: "J.R.R. Tolkien",
          isbn: "9780618640157",
          coverUrl: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them."
        },
        {
          title: "Dune",
          author: "Frank Herbert",
          isbn: "9780441172719",
          coverUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world."
        },
        
        // Hindi Fiction Books
        {
          title: "गोदान (Godaan)",
          author: "Munshi Premchand",
          isbn: "9788126701209",
          coverUrl: "https://images.unsplash.com/photo-1576872381149-7847515ce5d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "गोदान मुंशी प्रेमचंद का एक प्रसिद्ध उपन्यास है जो भारतीय ग्रामीण जीवन की कठिनाइयों को दर्शाता है।"
        },
        {
          title: "नर्मदा की परिक्रमा (Narmada Ki Parikrama)",
          author: "Amritlal Vegad",
          isbn: "9788126701333",
          coverUrl: "https://images.unsplash.com/photo-1585213779953-1865d967d8b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "यह पुस्तक नर्मदा नदी की परिक्रमा के अनुभवों का वर्णन करती है, जिसमें आध्यात्मिक अनुभव और प्रकृति के साथ तादात्म्य का वर्णन है।"
        },
        {
          title: "रश्मिरथी (Rashmirathi)",
          author: "Ramdhari Singh Dinkar",
          isbn: "9788126701459",
          coverUrl: "https://images.unsplash.com/photo-1523481523502-41e078345d5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "रश्मिरथी महाभारत के कर्ण के चरित्र पर आधारित एक महाकाव्य है।"
        },
        {
          title: "मैला आँचल (Maila Anchal)",
          author: "Phanishwar Nath Renu",
          isbn: "9788126701564",
          coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "यह उपन्यास स्वतंत्रता के बाद के भारत के ग्रामीण जीवन का चित्रण करता है।"
        },
        {
          title: "मृगनयनी (Mriganayani)",
          author: "Vrindavan Lal Verma",
          isbn: "9788126701885",
          coverUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "यह एक ऐतिहासिक उपन्यास है जो मुगल काल की कहानी बयान करता है।"
        },
        
        // Hindi Non-Fiction and Other
        {
          title: "आत्मज्ञान (Atmagyan)",
          author: "Swami Vivekananda",
          isbn: "9788126701779",
          coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "स्वामी विवेकानंद के लेखों का संकलन जो आत्मज्ञान और आध्यात्मिक उन्नति पर केंद्रित है।"
        },
        {
          title: "कामायनी (Kamayani)",
          author: "Jaishankar Prasad",
          isbn: "9788126702021",
          coverUrl: "https://images.unsplash.com/photo-1490633874781-1c63cc424610?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "हिंदी की प्रमुख महाकाव्य काव्य रचना जो प्रलय के बाद मनु और श्रद्धा की कहानी है।"
        },
        
        // Devotional Books (English)
        {
          title: "The Bhagavad Gita",
          author: "Eknath Easwaran (Translator)",
          isbn: "9781586380199",
          coverUrl: "https://images.unsplash.com/photo-1629218079534-e9a69359fe6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A comprehensive translation of the Bhagavad Gita, with detailed explanations of its profound wisdom."
        },
        {
          title: "Autobiography of a Yogi",
          author: "Paramahansa Yogananda",
          isbn: "9780876120798",
          coverUrl: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Yogananda's life story, introducing millions of readers to meditation and yoga."
        },
        {
          title: "The Power of Now",
          author: "Eckhart Tolle",
          isbn: "9781577314806",
          coverUrl: "https://images.unsplash.com/photo-1584448097764-374ff483228f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A guide to spiritual enlightenment and living in the present moment."
        },
        
        // Devotional Books (Hindi)
        {
          title: "श्रीमद्भगवद्गीता यथारूप (Srimad Bhagavad Gita)",
          author: "A.C. Bhaktivedanta Swami Prabhupada",
          isbn: "9788189574086",
          coverUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "श्रीमद्भगवद्गीता का सरल और विस्तृत हिंदी अनुवाद तथा व्याख्या।"
        },
        {
          title: "हनुमान चालीसा (Hanuman Chalisa)",
          author: "Goswami Tulsidas",
          isbn: "9788189574123",
          coverUrl: "https://images.unsplash.com/photo-1582530239833-5448ef32ea93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "गोस्वामी तुलसीदास द्वारा रचित हनुमान जी की स्तुति में चालीस छंदों का संग्रह।"
        },
        {
          title: "रामचरितमानस (Ramcharitmanas)",
          author: "Goswami Tulsidas",
          isbn: "9788189574161",
          coverUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
          description: "तुलसीदास द्वारा अवधी भाषा में रचित रामायण का हिंदी काव्य रूपांतरण।"
        },
        
        // More English Fiction
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          isbn: "9780141439518",
          coverUrl: "https://images.unsplash.com/photo-1594312915251-48db9280c8f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "The story follows the main character, Elizabeth Bennet, as she deals with issues of manners, upbringing, morality, education, and marriage."
        },
        {
          title: "Brave New World",
          author: "Aldous Huxley",
          isbn: "9780060850524",
          coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A dystopian novel written in 1931 about a futuristic society where people are genetically bred and pharmaceutically conditioned to serve in a ruling order."
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          isbn: "9780062315007",
          coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A story about following your dreams and listening to your heart."
        },
        
        // Additional Hindi Books
        {
          title: "चंद्रकांता (Chandrakanta)",
          author: "Devaki Nandan Khatri",
          isbn: "9788126702243",
          coverUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "हिंदी का पहला टिलिस्मी और ऐय्यारी उपन्यास जो राजकुमारी चंद्रकांता और राजकुमार वीरेंद्र सिंह की प्रेम कहानी है।"
        },
        {
          title: "गुनाहों का देवता (Gunahon Ka Devta)",
          author: "Dharamvir Bharati",
          isbn: "9788126702366",
          coverUrl: "https://images.unsplash.com/photo-1493863641943-9a9eaaaef7ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "इस उपन्यास में एक अजीब प्रेम त्रिकोण का वर्णन है जिसमें भावनाओं का जटिल संघर्ष दिखाया गया है।"
        },
        
        // More Devotional
        {
          title: "Light on Yoga",
          author: "B.K.S. Iyengar",
          isbn: "9780805210316",
          coverUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A comprehensive guide to yoga poses, breathing exercises, and the philosophy of yoga."
        },
        {
          title: "Man's Search for Meaning",
          author: "Viktor E. Frankl",
          isbn: "9780807014271",
          coverUrl: "https://images.unsplash.com/photo-1517770413964-df8ca61194a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Frankl's memoir with lessons for spiritual survival based on his experiences in concentration camps."
        },
        
        // Additional Genres
        {
          title: "Murder on the Orient Express",
          author: "Agatha Christie",
          isbn: "9780062693662",
          coverUrl: "https://images.unsplash.com/photo-1587876931567-564ce588bfbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A detective novel featuring the Belgian detective Hercule Poirot."
        },
        {
          title: "वासुदेव शरण अग्रवाल संचयिता (Vasudev Sharan Agrawal Sanchayita)",
          author: "Vasudev Sharan Agrawal",
          isbn: "9788126702533",
          coverUrl: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "प्राचीन भारतीय इतिहास और संस्कृति के विषय पर निबंधों का संग्रह।"
        },
        {
          title: "The Da Vinci Code",
          author: "Dan Brown",
          isbn: "9780307474278",
          coverUrl: "https://images.unsplash.com/photo-1603289847962-9b46646bdae2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A mystery thriller novel that follows symbologist Robert Langdon and cryptologist Sophie Neveu as they investigate a murder in Paris's Louvre Museum."
        },
        {
          title: "जंगल के दावेदार (Jungle Ke Davedar)",
          author: "Sarveshwar Dayal Saxena",
          isbn: "9788126702762",
          coverUrl: "https://images.unsplash.com/photo-1536411396596-afed9fa3c1b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "जंगल और उसके निवासियों के जीवन पर आधारित कविताओं का संग्रह।"
        },
        {
          title: "The Prophet",
          author: "Kahlil Gibran",
          isbn: "9780394404288",
          coverUrl: "https://images.unsplash.com/photo-1618365568030-e0439092f0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "A book of 26 poetic essays covering all aspects of the human condition."
        },
        {
          title: "आषाढ़ का एक दिन (Ashadh Ka Ek Din)",
          author: "Mohan Rakesh",
          isbn: "9788126702946",
          coverUrl: "https://images.unsplash.com/photo-1574068865420-94f8a974ace6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "काव्य नाटक जो कवि कालिदास और उनकी प्रेमिका मल्लिका की कहानी पर आधारित है।"
        }
      ];
      
      // Add books to localStorage via bookService
      sampleBooks.forEach(book => {
        bookService.addBook(book);
      });
      
      console.log(`Seeded ${sampleBooks.length} books successfully!`);
      setIsDataSeeded(true);
    };
    
    seedBooks();
  }, []);
  
  return isDataSeeded;
} 