'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarDays, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MentorDashboardPage() {
  const { currentUser } = useAppContext();
  const router = useRouter();

  if (!currentUser || currentUser.role !== 'mentor') {
     if (typeof window !== 'undefined') router.push('/');
    return <p className="text-center py-10">Access Denied. Please log in as a mentor.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Mentor Dashboard</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary">
              <Users className="mr-2 h-6 w-6 text-accent" />
              Mentees
            </CardTitle>
            <CardDescription>View and manage your mentees.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Mentee matching and management features coming soon.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary">
              <CalendarDays className="mr-2 h-6 w-6 text-accent" />
              Schedule
            </CardTitle>
            <CardDescription>Manage your availability and scheduled sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Session scheduling tools coming soon.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary">
              <MessageCircle className="mr-2 h-6 w-6 text-accent" />
              Resources
            </CardTitle>
            <CardDescription>Access mentoring guides and resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Mentorship resources will be available here.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Your Profile</CardTitle>
          <CardDescription>Keep your mentor profile up to date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Name:</strong> {currentUser.name}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Title:</strong> {currentUser.professionalTitle}</p>
          <p><strong>Company:</strong> {currentUser.company}</p>
          <p><strong>Expertise:</strong> {currentUser.areasOfExpertise?.join(', ')}</p>
          {/* Add Button to Edit Profile - future feature */}
        </CardContent>
      </Card>

    </div>
  );
}
