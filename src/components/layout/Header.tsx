
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Home, LogIn, LogOut, UserPlus, Briefcase, Building, Users } from 'lucide-react';

export default function Header() {
  const { currentUser, logout } = useAppContext();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary hover:text-primary/80 transition-colors">
          Veteran Career Bridge
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {currentUser ? (
            <>
              {currentUser.role === 'veteran' && (
                <Link href="/dashboard/veteran" passHref>
                  <Button variant="ghost" className="text-sm sm:text-base">
                    <Briefcase className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">My Dashboard</span>
                  </Button>
                </Link>
              )}
              {currentUser.role === 'mentor' && (
                <Link href="/dashboard/mentor" passHref>
                  <Button variant="ghost" className="text-sm sm:text-base">
                     <Users className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Mentor Portal</span>
                  </Button>
                </Link>
              )}
              {currentUser.role === 'employer' && (
                <Link href="/dashboard/employer" passHref>
                  <Button variant="ghost" className="text-sm sm:text-base">
                    <Building className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Employer Portal</span>
                  </Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground hidden md:inline">Welcome, {currentUser.name}</span>
              <Button variant="outline" onClick={logout} size="sm">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost" className="text-sm sm:text-base">
                  <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
              <Link href="/#register" passHref>
                <Button variant="default" size="sm" className="text-sm sm:text-base bg-accent hover:bg-accent/90 text-accent-foreground">
                  <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Register</span>
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
