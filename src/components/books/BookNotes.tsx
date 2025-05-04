import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, BookMarked, FileText, Edit, Plus, MoreVertical, StickyNote, Trash2, Highlighter } from 'lucide-react';
import { BookNote } from '@/types/reading-features';
import { readingFeaturesService } from '@/lib/services';
import { Book } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookNotesProps {
  book: Book;
}

export function BookNotes({ book }: BookNotesProps) {
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState<BookNote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [noteContent, setNoteContent] = useState('');
  const [notePage, setNotePage] = useState<string>('');
  const [noteChapter, setNoteChapter] = useState('');
  const [isHighlight, setIsHighlight] = useState(false);
  const [highlightColor, setHighlightColor] = useState<string>('yellow');
  
  const colors = [
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-200' },
    { name: 'Green', value: 'green', class: 'bg-green-200' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-200' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-200' },
  ];
  
  useEffect(() => {
    if (book?.id) {
      loadNotes();
    }
  }, [book?.id]);
  
  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const bookNotes = await readingFeaturesService.notes.getNotesForBook(book.id);
      setNotes(Array.isArray(bookNotes) ? bookNotes : []);
    } catch (err) {
      console.error('Error loading book notes:', err);
      setError('Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setNoteContent('');
    setNotePage('');
    setNoteChapter('');
    setIsHighlight(false);
    setHighlightColor('yellow');
    setSelectedNote(null);
    setIsEditMode(false);
    setError(null);
  };
  
  const handleOpenNoteDialog = (note?: BookNote) => {
    if (note) {
      setSelectedNote(note);
      setNoteContent(note.content);
      setNotePage(note.page?.toString() || '');
      setNoteChapter(note.chapter || '');
      setIsHighlight(note.isHighlight);
      setHighlightColor(note.color || 'yellow');
      setIsEditMode(true);
    } else {
      resetForm();
      setIsEditMode(false);
    }
    
    setIsNoteDialogOpen(true);
  };
  
  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Parse page number if provided
      const pageNumber = notePage ? parseInt(notePage, 10) : undefined;
      
      if (isEditMode && selectedNote) {
        // Update existing note
        // Use the ID, content, page approach which works with both API and localStorage
        const result = await readingFeaturesService.notes.updateNote(
          selectedNote.id, 
          noteContent.trim(), 
          pageNumber
        );
        
        if (!result) {
          throw new Error('Failed to update note');
        }
      } else {
        // Create new note
        // The localStorage implementation doesn't support all these parameters
        // But we'll try to use them for the API implementation
        let result;
        try {
          // First try with the full API signature
          result = await readingFeaturesService.notes.createNote(
            book.id,
            noteContent.trim(),
            isHighlight,
            pageNumber,
            noteChapter.trim() || undefined,
            isHighlight ? highlightColor : undefined
          );
        } catch (error) {
          // Fallback to localStorage signature if needed
          result = await readingFeaturesService.notes.createNote(
            book.id,
            noteContent.trim(),
            pageNumber as any // Type cast to bypass type checking
          );
        }
        
        if (!result) {
          throw new Error('Failed to create note');
        }
      }
      
      // Close dialog and refresh notes
      setIsNoteDialogOpen(false);
      resetForm();
      await loadNotes();
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the note');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClick = (note: BookNote) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedNote) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await readingFeaturesService.notes.deleteNote(selectedNote.id);
      
      if (!success) {
        throw new Error('Failed to delete note');
      }
      
      setIsDeleteDialogOpen(false);
      setSelectedNote(null);
      await loadNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the note');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredNotes = notes.filter(note => {
    if (activeTab === 'all') return true;
    if (activeTab === 'notes') return !note.isHighlight;
    if (activeTab === 'highlights') return note.isHighlight;
    return true;
  });
  
  const renderNoteCard = (note: BookNote) => {
    const formattedDate = new Date(note.dateCreated).toLocaleDateString();
    const location = [];
    if (note.chapter) location.push(`Chapter: ${note.chapter}`);
    if (note.page) location.push(`Page: ${note.page}`);
    
    const getColorClass = (color: string) => {
      switch (color) {
        case 'yellow': return 'bg-yellow-100 border-yellow-400';
        case 'green': return 'bg-green-100 border-green-400';
        case 'blue': return 'bg-blue-100 border-blue-400';
        case 'pink': return 'bg-pink-100 border-pink-400';
        default: return 'bg-yellow-100 border-yellow-400';
      }
    };
    
    return (
      <div 
        key={note.id}
        className={`border rounded-md p-4 ${note.isHighlight ? `border-l-4 ${getColorClass(note.color || 'yellow')}` : ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {note.isHighlight ? (
              <Highlighter className="h-4 w-4 mr-2 text-amber-500" />
            ) : (
              <StickyNote className="h-4 w-4 mr-2 text-primary" />
            )}
            <span className="text-sm font-medium">
              {note.isHighlight ? 'Highlight' : 'Note'}
              {location.length > 0 && ` (${location.join(', ')})`}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenNoteDialog(note)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteClick(note)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className={note.isHighlight ? getColorClass(note.color || 'yellow') + ' p-2 rounded' : ''}>
          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
        </div>
        
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Added on {formattedDate}</span>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <BookMarked className="h-5 w-5 mr-2" />
                Notes & Highlights
              </CardTitle>
              <CardDescription>
                Capture your thoughts and important passages
              </CardDescription>
            </div>
            <Button 
              size="sm"
              onClick={() => handleOpenNoteDialog()}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="all">
                All ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes ({notes.filter(n => !n.isHighlight).length})
              </TabsTrigger>
              <TabsTrigger value="highlights">
                Highlights ({notes.filter(n => n.isHighlight).length})
              </TabsTrigger>
            </TabsList>
            
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {!isLoading && error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!isLoading && !error && (
              <TabsContent value="all" className="space-y-4">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map(renderNoteCard)
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You don't have any notes or highlights for this book yet.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => handleOpenNoteDialog()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Note
                    </Button>
                  </div>
                )}
              </TabsContent>
            )}
            
            <TabsContent value="notes" className="space-y-4">
              {filteredNotes.length > 0 ? (
                filteredNotes.map(renderNoteCard)
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You don't have any notes for this book yet.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleOpenNoteDialog()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Note
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="highlights" className="space-y-4">
              {filteredNotes.length > 0 ? (
                filteredNotes.map(renderNoteCard)
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You don't have any highlights for this book yet.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      resetForm();
                      setIsHighlight(true);
                      setIsNoteDialogOpen(true);
                    }}
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Add Your First Highlight
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add/Edit Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode 
                ? (isHighlight ? 'Edit Highlight' : 'Edit Note') 
                : (isHighlight ? 'Add Highlight' : 'Add Note')}
            </DialogTitle>
            <DialogDescription>
              {isHighlight 
                ? 'Capture important passages from the book' 
                : 'Write down your thoughts about the book'}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center">
              <Label htmlFor="is-highlight" className="mr-2">Type:</Label>
              <div className="flex space-x-4">
                <Label
                  htmlFor="note-type-note"
                  className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer ${!isHighlight ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => setIsHighlight(false)}
                >
                  <StickyNote className="h-4 w-4" />
                  <span>Note</span>
                </Label>
                <Label
                  htmlFor="note-type-highlight"
                  className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer ${isHighlight ? 'bg-primary/10 border-primary' : ''}`}
                  onClick={() => setIsHighlight(true)}
                >
                  <Highlighter className="h-4 w-4" />
                  <span>Highlight</span>
                </Label>
              </div>
            </div>
            
            {isHighlight && (
              <div className="grid gap-2">
                <Label>Highlight Color:</Label>
                <div className="flex space-x-2">
                  {colors.map(color => (
                    <div
                      key={color.value}
                      className={`w-8 h-8 rounded-full ${color.class} cursor-pointer ${
                        highlightColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      onClick={() => setHighlightColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="note-content">Content:</Label>
              <Textarea
                id="note-content"
                rows={5}
                placeholder={isHighlight ? "Enter the text you want to highlight..." : "Write your note here..."}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="note-chapter">Chapter (optional):</Label>
                <Input
                  id="note-chapter"
                  placeholder="e.g. Chapter 5"
                  value={noteChapter}
                  onChange={(e) => setNoteChapter(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note-page">Page (optional):</Label>
                <Input
                  id="note-page"
                  type="number"
                  placeholder="e.g. 42"
                  value={notePage}
                  onChange={(e) => setNotePage(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNoteDialogOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNote}
              disabled={isLoading || !noteContent.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                  Saving...
                </span>
              ) : (
                isEditMode ? 'Update' : 'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {selectedNote?.isHighlight ? 'highlight' : 'note'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></span>
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 