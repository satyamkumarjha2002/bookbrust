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

interface BookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBook: BookshelfItem;
  onSave: () => void;
}

export function BookEditModal({ isOpen, onClose, userBook, onSave }: BookEditModalProps) {
  const [status, setStatus] = useState(userBook.status);
  const [notes, setNotes] = useState(userBook.notes || '');
  const [rating, setRating] = useState(userBook.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  const handleSave = () => {
    setIsSubmitting(true);
    
    try {
      userBookService.updateUserBook(userBook.id, {
        status,
        notes,
        rating,
        dateUpdated: new Date().toISOString()
      });
      
      onSave();
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = () => {
    try {
      userBookService.removeUserBook(userBook.id);
      onSave();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };
  
  const handleRatingChange = (value: string) => {
    setRating(parseInt(value, 10));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-start gap-4">
            <img 
              src={userBook.book.coverUrl || '/images/default-book-cover.jpg'} 
              alt={userBook.book.title}
              className="w-20 h-28 object-cover rounded-sm"
            />
            <div>
              <h3 className="font-medium">{userBook.book.title}</h3>
              <p className="text-sm text-muted-foreground">{userBook.book.author}</p>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as BookStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BookStatus.READING}>Reading</SelectItem>
                <SelectItem value={BookStatus.FINISHED}>Finished</SelectItem>
                <SelectItem value={BookStatus.WANT_TO_READ}>Want to Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="rating">Rating</Label>
            <Select 
              value={rating.toString()} 
              onValueChange={handleRatingChange}
            >
              <SelectTrigger id="rating">
                <SelectValue placeholder="Select a rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No rating</SelectItem>
                <SelectItem value="1">★</SelectItem>
                <SelectItem value="2">★★</SelectItem>
                <SelectItem value="3">★★★</SelectItem>
                <SelectItem value="4">★★★★</SelectItem>
                <SelectItem value="5">★★★★★</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this book"
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-500">
                <Trash2Icon className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove "{userBook.book.title}" from your bookshelf. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSubmitting}
              type="button"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 