"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/services"
import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react"

export function SiteHeader() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
  }, [pathname])
  
  const handleLogout = () => {
    authService.logout()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpenIcon className="h-6 w-6" />
            <span className="font-bold text-xl">BookBrust</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <nav className="flex items-center space-x-4 lg:space-x-6">
                <Link
                  href="/dashboard"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/dashboard"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/profile"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Profile
                </Link>
              </nav>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/login"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Login
              </Link>
              <Button asChild>
                <Link href="/signup">
                  Sign Up
                </Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
