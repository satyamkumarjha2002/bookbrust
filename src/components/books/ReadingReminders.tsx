import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Trash2, Clock, AlarmClock } from 'lucide-react';
import { ReadingReminder } from '@/types/reading-features';
import { reminderService } from '@/lib/services/readingFeaturesService';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ReadingReminders() {
  const [reminders, setReminders] = useState<ReadingReminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [reminderDays, setReminderDays] = useState<boolean[]>([
    false, false, false, false, false, false, false
  ]);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [reminderMessage, setReminderMessage] = useState('Time to read!');
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  useEffect(() => {
    loadReminders();
  }, []);
  
  const loadReminders = () => {
    try {
      const list = reminderService.getReminders();
      setReminders(list);
    } catch (error) {
      console.error('Error loading reading reminders:', error);
    }
  };
  
  const handleCreateReminder = () => {
    try {
      // Validate that at least one day is selected
      if (!reminderDays.some(day => day)) {
        setError('Please select at least one day for your reminder');
        return;
      }
      
      reminderService.createReminder('general', reminderTime, reminderMessage);
      setIsDialogOpen(false);
      resetForm();
      loadReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred creating the reminder');
      }
    }
  };
  
  const resetForm = () => {
    setReminderDays([false, false, false, false, false, false, false]);
    setReminderTime('19:00');
    setReminderMessage('Time to read!');
    setError('');
  };
  
  const handleDayChange = (index: number, checked: boolean) => {
    const newDays = [...reminderDays];
    newDays[index] = checked;
    setReminderDays(newDays);
  };
  
  const handleToggleReminder = (reminderId: string) => {
    try {
      reminderService.markReminderComplete(reminderId);
      loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };
  
  const handleDeleteReminder = (reminderId: string) => {
    try {
      reminderService.deleteReminder(reminderId);
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };
  
  const formatReminder = (reminder: ReadingReminder) => {
    const selectedDays = reminder.days
      .map((day, index) => day ? daysOfWeek[index] : null)
      .filter(Boolean)
      .join(', ');
      
    return `${selectedDays} at ${reminder.time}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Reading Reminders
        </CardTitle>
        <CardDescription>
          Set reminders to establish a regular reading habit
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reminders.length > 0 ? (
          <div className="space-y-4">
            {reminders.map(reminder => (
              <div 
                key={reminder.id}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <div className="flex-grow mr-2">
                  <div className="flex items-center">
                    <AlarmClock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium text-sm">{formatReminder(reminder)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reminder.message}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={reminder.isActive} 
                    onCheckedChange={() => handleToggleReminder(reminder.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              You don't have any reading reminders set up yet.
            </p>
          </div>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reading Reminder</DialogTitle>
              <DialogDescription>
                Set a schedule to remind yourself to read regularly
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Days of the week</Label>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, index) => (
                    <div key={day} className="flex flex-col items-center">
                      <Checkbox 
                        id={`day-${index}`}
                        checked={reminderDays[index]}
                        onCheckedChange={(checked) => 
                          handleDayChange(index, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={`day-${index}`}
                        className="text-xs mt-1"
                      >
                        {day.slice(0, 1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="reminderTime">Time</Label>
                <Input 
                  id="reminderTime" 
                  type="time" 
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="reminderMessage">Message</Label>
                <Input 
                  id="reminderMessage" 
                  value={reminderMessage}
                  onChange={e => setReminderMessage(e.target.value)}
                  placeholder="Reminder message"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateReminder}>
                Create Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Separator className="my-4" />
        
        <div className="rounded-md bg-muted p-4">
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <h3 className="text-sm font-medium">Reading Habit Tips</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Reading at the same time each day helps build a habit</li>
            <li>Even 15-20 minutes daily can significantly improve your reading</li>
            <li>Consider setting reminders for times when you're typically free</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 