import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Book, Target, Plus, Edit, Check } from 'lucide-react';
import { ReadingChallenge } from '@/types/reading-features';
import { readingFeaturesService } from '@/lib/services';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ReadingChallengeComponent() {
  const [challenge, setChallenge] = useState<ReadingChallenge | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetBooks, setTargetBooks] = useState(12); // Default to 1 book per month
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      setIsLoading(true);
      const currentChallenge = await readingFeaturesService.challenges.getCurrentChallenge();
      setChallenge(currentChallenge);
      
      if (currentChallenge) {
        // If we have a challenge, update target books to match current target
        setTargetBooks(currentChallenge.targetBooks);
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      setError('Failed to load reading challenge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      setIsLoading(true);
      if (targetBooks <= 0) {
        setError('Please enter a number greater than 0');
        return;
      }
      
      const newChallenge = await readingFeaturesService.challenges.createChallenge(targetBooks);
      if (newChallenge) {
        setChallenge(newChallenge);
        setIsDialogOpen(false);
        setError('');
      } else {
        setError('Failed to create challenge');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred creating the challenge');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChallenge = async () => {
    if (!challenge) return;
    
    try {
      setIsLoading(true);
      if (targetBooks <= 0) {
        setError('Please enter a number greater than 0');
        return;
      }
      
      const updatedChallenge = { ...challenge, targetBooks };
      const result = await readingFeaturesService.challenges.updateChallenge(updatedChallenge);
      if (result) {
        setChallenge(result);
        setIsDialogOpen(false);
        setError('');
      } else {
        setError('Failed to update challenge');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred updating the challenge');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = challenge 
    ? Math.min(100, Math.round((challenge.booksRead / challenge.targetBooks) * 100)) 
    : 0;

  const getStatusColor = () => {
    if (!challenge) return 'bg-gray-200';
    
    if (challenge.completed) return 'bg-green-500';
    
    // If more than 75% complete, show as green
    if (progressPercentage >= 75) return 'bg-green-500';
    // If more than 50% complete, show as yellow
    if (progressPercentage >= 50) return 'bg-yellow-500';
    // If more than 25% complete, show as orange
    if (progressPercentage >= 25) return 'bg-orange-500';
    // Otherwise, show as red
    return 'bg-red-500';
  };

  const daysLeft = challenge 
    ? Math.max(0, Math.floor((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) 
    : 0;

  const renderCreateButton = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reading Challenge</CardTitle>
        <CardDescription>
          Set a reading goal for the year and track your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <Target className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center mb-6">
          You don't have a reading challenge for this year yet.
          Set a target number of books to read and track your progress!
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Reading Challenge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reading Challenge</DialogTitle>
              <DialogDescription>
                Set your reading goal for {new Date().getFullYear()}
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="targetBooks">Target number of books</Label>
                <Input 
                  id="targetBooks" 
                  type="number" 
                  min="1"
                  value={targetBooks} 
                  onChange={(e) => setTargetBooks(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateChallenge}>
                Create Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderExistingChallenge = () => {
    if (!challenge) return null;
    
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reading Challenge {challenge.year}</CardTitle>
              <CardDescription>
                {challenge.completed 
                  ? 'Congratulations! You completed your challenge!' 
                  : `${daysLeft} days left to complete your challenge`}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Reading Challenge</DialogTitle>
                  <DialogDescription>
                    Change your reading goal for {challenge.year}
                  </DialogDescription>
                </DialogHeader>
                
                {error && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="targetBooks">Target number of books</Label>
                    <Input 
                      id="targetBooks" 
                      type="number" 
                      min="1"
                      value={targetBooks} 
                      onChange={(e) => setTargetBooks(Number(e.target.value))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateChallenge}>
                    Update Challenge
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Book className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">{challenge.booksRead} of {challenge.targetBooks} books</span>
            </div>
            {challenge.completed && (
              <div className="flex items-center text-green-500">
                <Check className="h-5 w-5 mr-1" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2"
            indicatorClassName={getStatusColor()}
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progressPercentage}% complete</span>
            <span>{challenge.booksRead} / {challenge.targetBooks}</span>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          {challenge.completed ? (
            <div className="flex items-center w-full justify-center text-green-500">
              <Trophy className="h-5 w-5 mr-2" />
              <span className="font-medium">Challenge completed! Congratulations!</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              To stay on track, you should read about {Math.ceil((challenge.targetBooks - challenge.booksRead) / (daysLeft / 30))} books per month.
            </p>
          )}
        </CardFooter>
      </Card>
    );
  };

  return challenge ? renderExistingChallenge() : renderCreateButton();
} 