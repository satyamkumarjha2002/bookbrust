import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from './StarRating';
import { BookStatus, UserBook, Book } from '@/types';
import { userBookService } from '@/lib/services';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2Icon } from 'lucide-react';

type BookshelfItem = UserBook & { book: Book };

type BookEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userBook: BookshelfItem;
  onSave: () => void;
};

export function BookEditModal({ isOpen, onClose, userBook, onSave }: BookEditModalProps) {
  // State for form fields
  const [status, setStatus] = useState<BookStatus>(userBook.status);
  const [rating, setRating] = useState<number | undefined>(userBook.rating);
  const [notes, setNotes] = useState<string | undefined>(userBook.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await userBookService.updateUserBook(userBook.id, {
        status,
        rating,
        notes: notes?.trim() || undefined,
      });
      
      onSave();
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle book deletion
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      await userBookService.removeUserBook(userBook.id);
      setIsDeleteAlertOpen(false);
      onSave();
    } catch (error) {
      console.error('Error removing book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center">
              <div className="w-16 h-24 mr-4 overflow-hidden rounded-sm">
                <img 
                  src={userBook.book.coverUrl || '/images/default-book-cover.jpg'} 
                  alt={userBook.book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{userBook.book.title}</h3>
                <p className="text-sm text-muted-foreground">{userBook.book.author}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as BookStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BookStatus.WANT_TO_READ}>Want to Read</SelectItem>
                  <SelectItem value={BookStatus.READING}>Currently Reading</SelectItem>
                  <SelectItem value={BookStatus.FINISHED}>Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <StarRating 
                value={rating || 0} 
                onChange={setRating}
                size="md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your personal notes about this book..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsDeleteAlertOpen(true)}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{userBook.book.title}" from your bookshelf.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Removing...' : 'Remove Book'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 