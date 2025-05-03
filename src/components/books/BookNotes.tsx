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
import { noteService } from '@/lib/services/readingFeaturesService';
import { Book } from '@/types';

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
    loadNotes();
  }, [book.id]);
  
  const loadNotes = () => {
    try {
      const bookNotes = noteService.getNotesForBook(book.id);
      setNotes(bookNotes);
    } catch (error) {
      console.error('Error loading book notes:', error);
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
  
  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    
    try {
      const page = notePage ? parseInt(notePage, 10) : undefined;
      
      if (isEditMode && selectedNote) {
        noteService.updateNote({
          ...selectedNote,
          content: noteContent,
          page,
          chapter: noteChapter || undefined,
          isHighlight,
          color: isHighlight ? highlightColor : undefined
        });
      } else {
        noteService.createNote(
          book.id,
          noteContent,
          isHighlight,
          page,
          noteChapter || undefined,
          isHighlight ? highlightColor : undefined
        );
      }
      
      setIsNoteDialogOpen(false);
      resetForm();
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };
  
  const handleDeleteClick = (note: BookNote) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (!selectedNote) return;
    
    try {
      noteService.deleteNote(selectedNote.id);
      setIsDeleteDialogOpen(false);
      setSelectedNote(null);
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
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
    
    return (
      <div 
        key={note.id}
        className={`border rounded-md p-4 ${note.isHighlight ? `border-l-4 border-l-${note.color}-400` : ''}`}
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
        
        <div className={note.isHighlight ? `p-2 rounded bg-${note.color}-100` : ''}>
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
                    onClick={() => {
                      setIsHighlight(false);
                      handleOpenNoteDialog();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
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
                      setIsHighlight(true);
                      handleOpenNoteDialog();
                    }}
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Add Highlight
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode 
                ? `Edit ${selectedNote?.isHighlight ? 'Highlight' : 'Note'}` 
                : `Add ${isHighlight ? 'Highlight' : 'Note'}`}
            </DialogTitle>
            <DialogDescription>
              {isHighlight 
                ? 'Save meaningful quotes and passages' 
                : 'Record your thoughts and reflections'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="page">Page</Label>
                  <Input 
                    id="page" 
                    type="number" 
                    min="1"
                    placeholder="Optional"
                    value={notePage}
                    onChange={(e) => setNotePage(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapter</Label>
                  <Input 
                    id="chapter" 
                    placeholder="Optional"
                    value={noteChapter}
                    onChange={(e) => setNoteChapter(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">{isHighlight ? 'Highlighted text' : 'Note'}</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="isHighlight" className="text-sm cursor-pointer">
                      Highlight
                    </Label>
                    <input 
                      type="checkbox"
                      id="isHighlight"
                      checked={isHighlight}
                      onChange={(e) => setIsHighlight(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
                <Textarea 
                  id="content" 
                  rows={5}
                  placeholder={
                    isHighlight 
                      ? 'Enter the text you want to highlight' 
                      : 'Write your thoughts about this book'
                  }
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
              
              {isHighlight && (
                <div className="space-y-2">
                  <Label>Highlight color</Label>
                  <div className="flex space-x-2">
                    {colors.map(color => (
                      <button 
                        key={color.value}
                        type="button"
                        className={`w-6 h-6 rounded-full ${color.class} ${
                          highlightColor === color.value 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : ''
                        }`}
                        title={color.name}
                        onClick={() => setHighlightColor(color.value)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNoteDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {selectedNote?.isHighlight ? 'highlight' : 'note'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 