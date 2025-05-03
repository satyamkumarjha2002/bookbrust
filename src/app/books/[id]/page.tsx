"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService, bookService, userBookService, reviewService } from '@/lib/services';
import { BookStatus, Book, UserBook, Review } from '@/types';
import { StarRating } from '@/components/books/StarRating';
import { ReadingTimer, BookNotes } from '@/components/books/ReadingFeatures';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, BookOpen, Bookmark, BookmarkCheck, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [status, setStatus] = useState<BookStatus>(BookStatus.WANT_TO_READ);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('log');
  
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadBookData();
  }, [params.id, router]);
  
  const loadBookData = () => {
    // Load book data
    const bookData = bookService.getBookById(params.id);
    if (!bookData) {
      router.push('/dashboard');
      return;
    }
    setBook(bookData);
    
    // Load user's book data if available
    const userBookData = userBookService.getUserBookByBookId(params.id);
    if (userBookData) {
      setUserBook(userBookData);
      setStatus(userBookData.status);
      setRating(userBookData.rating || 0);
      setNotes(userBookData.notes || '');
    }
    
    // Load reviews
    const bookReviews = reviewService.getBookReviews(params.id);
    setReviews(bookReviews);
    
    // Load user review if available
    const userReviewData = reviewService.getUserReviewForBook(params.id);
    if (userReviewData) {
      setUserReview(userReviewData);
      setReviewContent(userReviewData.content);
      setReviewRating(userReviewData.rating);
      setIsPublic(userReviewData.isPublic);
    }
  };
  
  const handleSaveLog = () => {
    try {
      if (!book) return;
      
      userBookService.addUserBook(
        book.id,
        status,
        rating > 0 ? rating : undefined,
        notes.trim() || undefined
      );
      
      setIsEditing(false);
      loadBookData(); // Reload data
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to save your book log. Please try again.');
      console.error(error);
    }
  };
  
  const handleRemoveFromShelf = () => {
    try {
      if (userBook) {
        userBookService.removeUserBook(userBook.id);
        router.push('/dashboard');
      }
    } catch (error) {
      setErrorMessage('Failed to remove book from your shelf. Please try again.');
      console.error(error);
    }
  };
  
  const handleSaveReview = () => {
    try {
      if (!book || !reviewContent.trim() || reviewRating === 0) {
        setErrorMessage('Please add a review and rating before saving.');
        return;
      }
      
      reviewService.addReview(book.id, reviewContent, reviewRating, isPublic);
      
      loadBookData(); // Reload reviews
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to save your review. Please try again.');
      console.error(error);
    }
  };
  
  const handleDeleteReview = () => {
    try {
      if (userReview) {
        reviewService.deleteReview(userReview.id);
        setUserReview(null);
        setReviewContent('');
        setReviewRating(0);
        loadBookData(); // Reload reviews
      }
    } catch (error) {
      setErrorMessage('Failed to delete your review. Please try again.');
      console.error(error);
    }
  };
  
  if (!book) {
    return <div className="container py-8">Loading...</div>;
  }
  
  const defaultCover = '/images/default-book-cover.jpg';
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Image and Metadata */}
        <div className="md:col-span-1">
          <div className="rounded-lg overflow-hidden border mb-4 shadow-sm">
            <div className="relative aspect-[2/3] w-full">
              <Image 
                src={book.coverUrl || defaultCover} 
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <Label className="text-sm text-muted-foreground">Author</Label>
              <p className="font-medium">{book.author}</p>
            </div>
            
            {book.isbn && (
              <div>
                <Label className="text-sm text-muted-foreground">ISBN</Label>
                <p className="font-medium">{book.isbn}</p>
              </div>
            )}
          </div>

          {/* Reading Timer Widget - NEW */}
          {userBook && userBook.status === BookStatus.READING && (
            <div className="mt-4">
              <ReadingTimer book={book} />
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          {userBook && userBook.rating ? (
            <div className="mb-4">
              <StarRating value={userBook.rating} readOnly />
            </div>
          ) : null}
          
          {book.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{book.description}</p>
            </div>
          )}
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="log">Reading Log</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="log" className="pt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Reading Log</CardTitle>
                    {userBook && !isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : null}
                  </div>
                  <CardDescription>
                    Track your reading progress and thoughts about this book
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!userBook && !isEditing ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        This book is not in your library yet.
                      </p>
                      <Button onClick={() => setIsEditing(true)}>
                        Add to Your Reading Log
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Reading Status</Label>
                        {isEditing ? (
                          <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as BookStatus)}
                          >
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={BookStatus.WANT_TO_READ}>
                                <div className="flex items-center">
                                  <Bookmark className="mr-2 h-4 w-4" />
                                  Want to Read
                                </div>
                              </SelectItem>
                              <SelectItem value={BookStatus.READING}>
                                <div className="flex items-center">
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Currently Reading
                                </div>
                              </SelectItem>
                              <SelectItem value={BookStatus.FINISHED}>
                                <div className="flex items-center">
                                  <BookmarkCheck className="mr-2 h-4 w-4" />
                                  Finished
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center">
                            {status === BookStatus.WANT_TO_READ && <Bookmark className="mr-2 h-4 w-4" />}
                            {status === BookStatus.READING && <BookOpen className="mr-2 h-4 w-4" />}
                            {status === BookStatus.FINISHED && <BookmarkCheck className="mr-2 h-4 w-4" />}
                            <span>
                              {status === BookStatus.WANT_TO_READ && 'Want to Read'}
                              {status === BookStatus.READING && 'Currently Reading'}
                              {status === BookStatus.FINISHED && 'Finished'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="rating">Your Rating</Label>
                        <StarRating
                          value={rating}
                          onChange={(value) => isEditing && setRating(value)}
                          readOnly={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        {isEditing ? (
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add your private notes about this book"
                            className="min-h-[100px]"
                          />
                        ) : (
                          <div className="p-3 border rounded-md bg-muted/20 min-h-[100px]">
                            {notes ? (
                              <p className="whitespace-pre-wrap">{notes}</p>
                            ) : (
                              <p className="text-muted-foreground">No notes yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {userBook && !isEditing && (
                        <div className="text-sm text-muted-foreground">
                          <p>Added to your shelf on {new Date(userBook.dateAdded).toLocaleDateString()}</p>
                          {userBook.status === BookStatus.FINISHED && (
                            <p>Finished on {new Date(userBook.dateUpdated).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className={cn("flex justify-between", !userBook && !isEditing && "hidden")}>
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => {
                        setIsEditing(false);
                        if (userBook) {
                          setStatus(userBook.status);
                          setRating(userBook.rating || 0);
                          setNotes(userBook.notes || '');
                        }
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveLog}>
                        Save
                      </Button>
                    </>
                  ) : (
                    userBook && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Shelf
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove &quot;{book.title}&quot; from your bookshelf.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRemoveFromShelf}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Reviews</CardTitle>
                  <CardDescription>
                    See what others think about this book or share your own review
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Your Review */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Review</h3>
                    {userReview ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <StarRating value={userReview.rating} readOnly />
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setReviewContent(userReview.content);
                                setReviewRating(userReview.rating);
                                setIsPublic(userReview.isPublic);
                                setUserReview(null); // Trigger edit mode
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={handleDeleteReview}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{userReview.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {userReview.isPublic ? 'Public review' : 'Private review'} • 
                          Last updated on {new Date(userReview.dateUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reviewRating">Rating</Label>
                          <StarRating
                            value={reviewRating}
                            onChange={setReviewRating}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="reviewContent">Review</Label>
                          <Textarea
                            id="reviewContent"
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            placeholder="What did you think about this book?"
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="isPublic" className="text-sm cursor-pointer">
                            Make this review public
                          </Label>
                        </div>
                        
                        <Button onClick={handleSaveReview}>
                          Submit Review
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Other Reviews */}
                  {reviews.length > 0 ? (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-medium">
                          {reviews.length === 1 
                            ? '1 Review from Other Readers' 
                            : `${reviews.length} Reviews from Other Readers`}
                        </h3>
                        
                        {reviews.map(review => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-start justify-between">
                              <StarRating value={review.rating} readOnly size="sm" />
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.dateCreated).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm mt-2 whitespace-pre-wrap">{review.content}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        No reviews yet. Be the first to review this book!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notes & Highlights Tab - NEW */}
            <TabsContent value="notes" className="pt-4">
              {userBook ? (
                <BookNotes book={book} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Notes & Highlights</CardTitle>
                    <CardDescription>
                      Capture your thoughts and highlight important passages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Add this book to your shelf to take notes and create highlights.
                      </p>
                      <Button onClick={() => {
                        setActiveTab('log');
                        setIsEditing(true);
                      }}>
                        Add to Your Shelf
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 