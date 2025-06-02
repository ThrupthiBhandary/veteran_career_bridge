'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Job } from '@/types';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


const jobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location is required"),
  requiredSkills: z.string().min(1, "Please list at least one required skill (comma-separated)"),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const { currentUser, addJob } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const { handleSubmit, register, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });
  
  if (!currentUser || currentUser.role !== 'employer') {
    // This should ideally be handled by a layout or middleware
    if (typeof window !== 'undefined') router.push('/');
    return <p className="text-center py-10">Access Denied. Please log in as an employer to post jobs.</p>;
  }

  const onSubmit = (data: JobFormData) => {
    const jobData: Omit<Job, 'id' | 'postedDate' | 'employerId' | 'employerName'> = {
      title: data.title,
      description: data.description,
      location: data.location,
      requiredSkills: data.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill),
    };
    addJob(jobData);
    toast({
      title: "Job Posted Successfully!",
      description: `The job "${data.title}" has been posted.`,
      variant: "default",
    });
    router.push('/dashboard/employer');
  };

  return (
    <div className="space-y-6">
       <Link href="/dashboard/employer" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Employer Dashboard
      </Link>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Post a New Job</CardTitle>
          <CardDescription>Fill in the details below to reach talented veterans.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" {...register('description')} rows={5} placeholder="Provide a detailed job description, responsibilities, and qualifications..." />
              {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="e.g., City, State or Remote" />
              {errors.location && <p className="text-destructive text-sm mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Label htmlFor="requiredSkills">Required Skills (comma-separated)</Label>
              <Input id="requiredSkills" {...register('requiredSkills')} placeholder="e.g., Project Management, Java, Leadership" />
              {errors.requiredSkills && <p className="text-destructive text-sm mt-1">{errors.requiredSkills.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Post Job</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
