"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export function AppFooter() {
  const [year, setYear] = useState<number>(2024); // Default static year
  
  useEffect(() => {
    // Update year on client-side only
    setYear(new Date().getFullYear());
  }, []);
  
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
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
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {year} BookBrust. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 