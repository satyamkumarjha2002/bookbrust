import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from '@/components/app-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookBrust',
  description: 'A fresh start for BookBrust project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider className="flex flex-col">
            <SiteHeader />
            <div className="flex flex-1">
              <AppSidebar />
              <main className="flex-1 p-4">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
