
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { skillMatching, type SkillMatchingOutput } from '@/ai/flows/skill-matching';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, CheckCircle, FileText, MessageSquare, AlertTriangle, Star, Zap, Brain } from 'lucide-react';
import type { Job, Application } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface EnrichedJob extends Job {
  matchResult?: SkillMatchingOutput;
  isLoadingMatch?: boolean;
  matchError?: string;
}

export default function VeteranDashboardPage() {
  const { currentUser, jobs, applications, applyForJob, getApplicationsByVeteran } = useAppContext();
  const [enrichedJobs, setEnrichedJobs] = useState<EnrichedJob[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'veteran') {
      if (typeof window !== 'undefined') router.push('/');
      return;
    }

    const fetchMatches = async () => {
      if (!currentUser.skills || currentUser.skills.length === 0) {
         // Even if no skills, preferences might exist, but skill match is primary
         // The AI flow will handle empty skills gracefully for preference matching.
         // However, we still prompt for skills for a good experience.
         setEnrichedJobs(jobs.map(job => ({ ...job, isLoadingMatch: false, matchError: "Please update your profile with skills to see job matches."})));
        // If you want to proceed with preference-only matching when skills are absent,
        // you could remove the early return and let the AI handle it.
        // For now, keeping skill prompt.
        // return; 
      }

      setEnrichedJobs(jobs.map(job => ({ ...job, isLoadingMatch: true })));

      const updatedJobs = await Promise.all(
        jobs.map(async (job) => {
          try {
            const matchResult = await skillMatching({
              veteranSkills: currentUser.skills || [],
              jobDescription: job.description,
              desiredIndustry: currentUser.desiredIndustry || [],
              desiredJobTitle: currentUser.desiredJobTitle || [],
            });
            return { ...job, matchResult, isLoadingMatch: false };
          } catch (error) {
            console.error(`Error matching job ${job.id}:`, error);
            return { ...job, isLoadingMatch: false, matchError: "Could not fetch match details." };
          }
        })
      );
      setEnrichedJobs(updatedJobs.sort((a, b) => (b.matchResult?.matchScore || 0) - (a.matchResult?.matchScore || 0)));
    };

    fetchMatches();
  }, [currentUser, jobs, router]);

  if (!currentUser || currentUser.role !== 'veteran') {
    return <p className="text-center py-10">Access Denied. Please log in as a veteran.</p>;
  }
  
  const veteranApplications = getApplicationsByVeteran(currentUser.id);

  const handleApply = (jobId: string, jobTitle: string) => {
    applyForJob(jobId);
    toast({
      title: "Application Submitted!",
      description: `You have successfully applied for ${jobTitle}.`,
    });
  };

  const isApplied = (jobId: string) => veteranApplications.some(app => app.jobId === jobId);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Veteran Dashboard</h1>
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="suggestions" className="font-body"><Zap className="mr-2 h-4 w-4"/>Job Suggestions</TabsTrigger>
          <TabsTrigger value="applications" className="font-body"><FileText className="mr-2 h-4 w-4"/>My Applications</TabsTrigger>
          <TabsTrigger value="collaboration" className="font-body"><MessageSquare className="mr-2 h-4 w-4"/>Collaboration Hub</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suggestions" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Recommended Job Openings</CardTitle>
              <CardDescription>Jobs matched to your skills and preferences. Update your profile for better matches.</CardDescription>
            </CardHeader>
            <CardContent>
              {enrichedJobs.length === 0 && !enrichedJobs.some(j => j.isLoadingMatch) && (
                 <div className="text-center py-10">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg text-muted-foreground">No job suggestions available right now. Check back later or ensure employers have posted jobs.</p>
                  </div>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrichedJobs.map((job) => (
                  <JobSuggestionCard 
                    key={job.id} 
                    job={job} 
                    onApply={handleApply} 
                    isApplied={isApplied(job.id)} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Application Tracking</CardTitle>
              <CardDescription>Monitor the status of your job applications.</CardDescription>
            </CardHeader>
            <CardContent>
              {veteranApplications.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg text-muted-foreground">You haven't applied for any jobs yet.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {veteranApplications.map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    return (
                      <li key={app.jobId} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold text-primary">{job?.title || 'Job not found'}</h3>
                            <p className="text-sm text-muted-foreground">Applied on: {new Date(app.appliedDate).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={app.status === 'Applied' ? 'secondary' : app.status === 'Offer Received' ? 'default' : 'outline'} className="capitalize bg-accent text-accent-foreground">
                            {app.status}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="collaboration" className="mt-6">
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Collaboration Hub</CardTitle>
              <CardDescription>Connect with fellow veterans, share experiences, and support each other.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg text-muted-foreground">Veteran collaboration features (forums, messaging) are coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface JobSuggestionCardProps {
  job: EnrichedJob;
  onApply: (jobId: string, jobTitle: string) => void;
  isApplied: boolean;
}

function JobSuggestionCard({ job, onApply, isApplied }: JobSuggestionCardProps) {
  const { matchResult, isLoadingMatch, matchError } = job;

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl text-primary">{job.title}</CardTitle>
          {matchResult && (
            <Badge variant="default" className="ml-2 whitespace-nowrap bg-accent text-accent-foreground">
              <Star className="mr-1 h-3 w-3" /> {matchResult.matchScore}% Match
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {job.employerName} - {job.location}
        </CardDescription>
        <p className="text-xs text-muted-foreground pt-1">Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm line-clamp-3 font-body text-foreground/80">{job.description}</p>
        {isLoadingMatch && (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
        {matchError && <p className="text-sm text-destructive font-medium"><AlertTriangle className="inline mr-1 h-4 w-4"/>{matchError}</p>}
        {matchResult && (
          <div className="space-y-2 text-sm pt-2">
             <div>
              <h4 className="font-semibold text-primary/90 flex items-center"><Brain className="mr-1 h-4 w-4 text-accent"/>AI Fit Summary:</h4>
              <p className="text-foreground/70 italic">{matchResult.overallFit}</p>
            </div>
            {matchResult.relevantSkills.length > 0 && (
              <div>
                <h4 className="font-semibold text-primary/90 flex items-center"><CheckCircle className="mr-1 h-4 w-4 text-green-600"/>Your Relevant Skills:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {matchResult.relevantSkills.slice(0,5).map(skill => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
                </div>
              </div>
            )}
            {matchResult.missingSkills.length > 0 && (
              <div>
                <h4 className="font-semibold text-primary/90 flex items-center"><AlertTriangle className="mr-1 h-4 w-4 text-amber-600"/>Skills to Develop:</h4>
                 <div className="flex flex-wrap gap-1 mt-1">
                  {matchResult.missingSkills.slice(0,5).map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onApply(job.id, job.title)} 
          disabled={isApplied || isLoadingMatch}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isApplied ? 'Applied' : isLoadingMatch ? 'Analyzing...' : 'Apply Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}

