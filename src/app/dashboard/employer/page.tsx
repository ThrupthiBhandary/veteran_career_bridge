
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, Briefcase, Eye } from 'lucide-react';
import type { Job } from '@/types';
import { useRouter } from 'next/navigation';

export default function EmployerDashboardPage() {
  const { currentUser, getJobsByEmployer, getApplicationsByJobId } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (currentUser === undefined) return; // Still loading from AppContext

    if (currentUser === null) {
      router.push('/login');
    } else if (currentUser.role !== 'employer') {
      router.push('/'); // Or a generic unauthorized page
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'employer') {
    return <p className="text-center py-10">Loading dashboard or access denied...</p>;
  }
  
  const postedJobs = getJobsByEmployer(currentUser.id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold text-primary">Employer Dashboard</h1>
        <Link href="/dashboard/employer/post-job" passHref>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Post New Job
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Your Posted Jobs</CardTitle>
          <CardDescription>Manage your job listings and view applications.</CardDescription>
        </CardHeader>
        <CardContent>
          {postedJobs.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">You haven&apos;t posted any jobs yet.</p>
              <Link href="/dashboard/employer/post-job" passHref className="mt-2">
                <Button variant="link" className="text-primary">Post your first job</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {postedJobs.map((job) => {
                const applications = getApplicationsByJobId(job.id);
                return <JobListItem key={job.id} job={job} applicantCount={applications.length} />;
              })}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Analytics Overview</CardTitle>
            <CardDescription>Track the performance of your job postings.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg text-muted-foreground">Hiring analytics coming soon.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface JobListItemProps {
  job: Job;
  applicantCount: number;
}

function JobListItem({ job, applicantCount }: JobListItemProps) {
  const router = useRouter();
  return (
    <li className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h3 className="text-xl font-semibold text-primary font-headline">{job.title}</h3>
          <p className="text-sm text-muted-foreground">{job.location} - Posted on {new Date(job.postedDate).toLocaleDateString()}</p>
          <p className="text-sm mt-1">Skills: {job.requiredSkills.join(', ')}</p>
          <p className="text-sm mt-1 font-medium text-accent">Applicants: {applicantCount}</p>
        </div>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/dashboard/employer/applicants/${job.id}`)}
          >
            <Eye className="mr-1 h-4 w-4" /> View Applicants
          </Button>
        </div>
      </div>
    </li>
  );
}
