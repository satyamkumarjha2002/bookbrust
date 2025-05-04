"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, userBookService, bookService } from '@/lib/services';
import { User, BookStatus } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { 
  UserIcon, 
  BookIcon, 
  BarChart3Icon, 
  BookOpenIcon, 
  CheckIcon, 
  ClockIcon, 
  SaveIcon, 
  LogOutIcon,
  BookmarkIcon
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [readingStats, setReadingStats] = useState({
    totalBooks: 0,
    booksRead: 0,
    booksReading: 0,
    booksToRead: 0,
    averageRating: 0,
    readingStreak: 0
  });

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only proceed if we're on the client side
    if (!isClient) return;
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Load user profile
    loadUserProfile();
  }, [router, isClient]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.name || '');
        setEmail(currentUser.email);
        
        // Load reading statistics
        const userBooks = await userBookService.getUserBooks();
        
        const totalBooks = userBooks.length;
        const booksRead = userBooks.filter(book => book.status === BookStatus.FINISHED).length;
        const booksReading = userBooks.filter(book => book.status === BookStatus.READING).length;
        const booksToRead = userBooks.filter(book => book.status === BookStatus.WANT_TO_READ).length;
        
        // Calculate average rating
        const ratings = userBooks
          .filter(book => book.rating !== undefined && book.rating > 0)
          .map(book => book.rating as number);
        
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;
        
        // For demo purposes, let's simulate a reading streak
        const readingStreak = Math.floor(Math.random() * 30) + 1;
        
        setReadingStats({
          totalBooks,
          booksRead,
          booksReading,
          booksToRead,
          averageRating,
          readingStreak
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user) return;
      
      const updatedUser = await authService.updateProfile({ 
        name,
        email 
      });
      
      if (updatedUser) {
        setUser(updatedUser);
        setEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  // Show loading state when on server or still loading
  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // User initials for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    }
    
    return user?.email.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3Icon className="h-4 w-4 mr-2" />
              Reading Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and account settings
                  </CardDescription>
                </div>
                
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(getInitials())}`} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {editing ? (
                      <Input 
                        id="name" 
                        placeholder="Your name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md">
                        {user?.name || 'Not set'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {editing ? (
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md">
                        {user?.email}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                
                {editing ? (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reading Overview</CardTitle>
                <CardDescription>
                  Your reading activity and statistics
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard 
                    icon={<BookIcon className="h-5 w-5 text-green-500" />}
                    title="Total Books"
                    value={readingStats.totalBooks.toString()}
                  />
                  <StatCard 
                    icon={<CheckIcon className="h-5 w-5 text-blue-500" />}
                    title="Books Read"
                    value={readingStats.booksRead.toString()}
                  />
                  <StatCard 
                    icon={<BookmarkIcon className="h-5 w-5 text-amber-500" />}
                    title="Want to Read"
                    value={readingStats.booksToRead.toString()}
                  />
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard 
                    icon={<BookOpenIcon className="h-5 w-5 text-purple-500" />}
                    title="Currently Reading"
                    value={readingStats.booksReading.toString()}
                  />
                  <StatCard 
                    icon={<ClockIcon className="h-5 w-5 text-rose-500" />}
                    title="Reading Streak"
                    value={`${readingStats.readingStreak} days`}
                  />
                  <StatCard 
                    icon={<BarChart3Icon className="h-5 w-5 text-teal-500" />}
                    title="Average Rating"
                    value={readingStats.averageRating.toFixed(1)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Simple stat card component
function StatCard({ 
  icon, 
  title, 
  value 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center p-4 border rounded-lg">
      <div className="p-2 mr-4 bg-muted rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
} 