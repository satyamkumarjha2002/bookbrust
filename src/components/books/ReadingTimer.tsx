import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, PlayCircle, PauseCircle, BookOpen, CheckCircle } from 'lucide-react';
import { ReadingSession } from '@/types/reading-features';
import { timerService } from '@/lib/services/readingFeaturesService';
import { Book } from '@/types';
import { formatTime, formatDuration } from '@/lib/utils';

interface ReadingTimerProps {
  book: Book;
}

export function ReadingTimer({ book }: ReadingTimerProps) {
  const [activeSession, setActiveSession] = useState<ReadingSession | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [totalReadingTime, setTotalReadingTime] = useState(0);

  useEffect(() => {
    // Check if there's an existing session
    const currentSession = timerService.getCurrentSession();
    if (currentSession && currentSession.bookId === book.id) {
      setActiveSession(currentSession);
      
      // Calculate elapsed time
      const startTime = new Date(currentSession.startTime).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimer(elapsed);
      setIsRunning(true);
    }
    
    // Get total reading time for this book
    const total = timerService.getTotalReadingTime(book.id);
    setTotalReadingTime(total);
  }, [book.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const startReading = () => {
    try {
      const newSession = timerService.startSession(book.id);
      setActiveSession(newSession);
      setIsRunning(true);
      setTimer(0);
    } catch (error) {
      console.error('Error starting reading session:', error);
    }
  };

  const stopReading = () => {
    setIsRunning(false);
    setShowFinishDialog(true);
  };

  const completeSession = () => {
    if (!activeSession) return;
    
    try {
      const completed = timerService.endSession(activeSession.id, pagesRead);
      setActiveSession(null);
      setIsRunning(false);
      setTimer(0);
      setShowFinishDialog(false);
      
      // Update total reading time
      const total = timerService.getTotalReadingTime(book.id);
      setTotalReadingTime(total);
    } catch (error) {
      console.error('Error completing reading session:', error);
    }
  };

  const cancelSession = () => {
    setIsRunning(true);
    setShowFinishDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Reading Timer
          </CardTitle>
          <CardDescription>
            Track your reading sessions for this book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-4">
              {formatTime(timer)}
            </div>
            
            {!isRunning && !activeSession ? (
              <Button 
                size="lg" 
                onClick={startReading}
                className="w-full mb-4"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Reading
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="secondary"
                onClick={stopReading}
                className="w-full mb-4"
              >
                <PauseCircle className="h-5 w-5 mr-2" />
                Finish Session
              </Button>
            )}
          </div>
          
          {totalReadingTime > 0 && (
            <div className="border-t pt-4 mt-2">
              <p className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total time spent on this book:</span>
                <span className="font-medium">{formatDuration(totalReadingTime)}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Reading Session</AlertDialogTitle>
            <AlertDialogDescription>
              You've been reading for {formatDuration(timer)}. How many pages did you read?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="pagesRead">Pages read (optional)</Label>
              <Input 
                id="pagesRead" 
                type="number" 
                min="0" 
                placeholder="Number of pages"
                value={pagesRead === 0 ? '' : pagesRead}
                onChange={(e) => setPagesRead(Number(e.target.value))}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSession}>
              Continue Reading
            </AlertDialogCancel>
            <AlertDialogAction onClick={completeSession}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finish Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 