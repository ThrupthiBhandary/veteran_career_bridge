
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { Application, User, Job } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface ApplicantDetails extends Application {
  veteran?: User;
}

export default function JobApplicantsPage() {
  const { jobId } = useParams() as { jobId: string };
  const { 
    currentUser, 
    jobs, 
    getApplicationsByJobId, 
    getUserById, 
    updateApplicationStatus 
  } = useAppContext();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<ApplicantDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser === undefined) { // AppContext is still initializing
        setIsLoading(true);
        return;
    }

    if (!currentUser || currentUser.role !== 'employer') {
      router.push('/login');
      return;
    }

    const currentJob = jobs.find(j => j.id === jobId && j.employerId === currentUser.id);
    if (!currentJob) {
      setJob(null);
      setIsLoading(false);
      return;
    }
    setJob(currentJob);

    const jobApplications = getApplicationsByJobId(jobId);
    const detailedApplicants = jobApplications.map(app => ({
      ...app,
      veteran: getUserById(app.veteranId),
    }));
    setApplicants(detailedApplicants);
    setIsLoading(false);

  }, [jobId, currentUser, jobs, getApplicationsByJobId, getUserById, router]);

  if (isLoading) {
    return <p className="text-center py-10">Loading applicant data...</p>;
  }

  if (!currentUser || currentUser.role !== 'employer') {
    // This case should be handled by the useEffect redirect, but as a fallback:
    return <p className="text-center py-10">Access Denied. Please log in as an employer.</p>;
  }
  
  if (!job) { 
     return (
        <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">Job not found or you do not have permission to view its applicants.</p>
            <Link href="/dashboard/employer" passHref className="mt-4">
                <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
            </Link>
        </div>
     );
  }

  const handleStatusChange = (veteranId: string, newStatus: Application['status']) => {
    updateApplicationStatus(jobId, veteranId, newStatus);
    const updatedApplicants = applicants.map(app => 
      app.veteranId === veteranId ? { ...app, status: newStatus } : app
    );
    setApplicants(updatedApplicants);
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/employer" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Employer Dashboard
      </Link>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Applicants for {job.title}</CardTitle>
          <CardDescription>Manage applications for your job posting: {job.location}.</CardDescription>
        </CardHeader>
        <CardContent>
          {applicants.length === 0 ? (
            <div className="text-center py-10">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No applicants for this job yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map(app => (
                  <TableRow key={app.veteranId}>
                    <TableCell className="font-medium">{app.veteran?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={app.status === 'Applied' ? 'secondary' : app.status === 'Offer Received' ? 'default' : 'outline'} 
                        className="capitalize"
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        onValueChange={(newStatus) => handleStatusChange(app.veteranId, newStatus as Application['status'])}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Under Review">Under Review</SelectItem>
                          <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                          <SelectItem value="Offer Received">Offer Received</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
