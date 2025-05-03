"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpenIcon, BookmarkIcon, StarIcon, UsersIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Track Your Reading Journey with BookBrust
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Organize your books, track your progress, and connect with fellow readers.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/signup" passHref>
                <Button className="px-8">Get Started</Button>
              </Link>
              <Link href="/login" passHref>
                <Button variant="outline" className="px-8">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400">
              Everything you need to elevate your reading experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpenIcon className="h-10 w-10 text-blue-500" />}
              title="Track Your Reading"
              description="Keep track of what you're reading, have read, and want to read next."
            />
            <FeatureCard
              icon={<StarIcon className="h-10 w-10 text-yellow-500" />}
              title="Rate & Review"
              description="Share your thoughts and ratings on the books you've read."
            />
            <FeatureCard
              icon={<BookmarkIcon className="h-10 w-10 text-green-500" />}
              title="Personalized Bookshelf"
              description="Organize your books into custom categories and lists."
            />
            <FeatureCard
              icon={<UsersIcon className="h-10 w-10 text-purple-500" />}
              title="Community"
              description="Connect with other readers and discover new books."
            />
            <FeatureCard
              icon={<BookOpenIcon className="h-10 w-10 text-red-500" />}
              title="Reading Stats"
              description="See statistics about your reading habits and progress."
            />
            <FeatureCard
              icon={<StarIcon className="h-10 w-10 text-orange-500" />}
              title="Discover New Books"
              description="Get personalized recommendations based on your reading history."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Start Your Reading Journey?
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/90">
                Join thousands of readers who use BookBrust to track their reading progress and discover new books.
              </p>
            </div>
            <Link href="/signup" passHref>
              <Button variant="secondary" size="lg" className="mt-4">
                Sign Up for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 md:px-6 py-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold">BookBrust</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your personal reading companion</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <Link href="/signup" className="text-sm hover:underline">
                Sign Up
              </Link>
              <Link href="/about" className="text-sm hover:underline">
                About
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} BookBrust. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg shadow-sm">
      <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
