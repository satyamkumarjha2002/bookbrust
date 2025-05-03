'use client';

import { SidebarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { ModeToggle } from './ui/mode-toggle';
import { SidebarWrapper } from '@/app/sidebar-wrapper';

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex sticky top-0 left-0 right-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center justify-between px-4">
        <SidebarWrapper>
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">BookBrust</h1>
        </SidebarWrapper>
        <ModeToggle />
      </div>
    </header>
  );
}
