'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import RegistrationFormWrapper from '@/components/auth/RegistrationFormWrapper';
import type { User } from '@/types';
import { useToast } from "@/hooks/use-toast";

const mentorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  professionalTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  industry: z.string().min(1, "Industry is required"),
  yearsProfessionalExperience: z.coerce.number().min(0, "Years of experience cannot be negative"),
  areasOfExpertise: z.string().min(1, "Please list areas of expertise (comma-separated)"),
  mentoringAvailability: z.string().optional(),
  mentoringCommunication: z.string().optional(),
  mentoringMotivation: z.string().min(10, "Motivation statement is too short").optional(),
});

type MentorFormData = z.infer<typeof mentorSchema>;

export default function MentorRegistrationPage() {
  const { login } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const { control, handleSubmit, register, formState: { errors } } = useForm<MentorFormData>({
    resolver: zodResolver(mentorSchema),
  });

  const onSubmit = (data: MentorFormData) => {
    const mentorUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'mentor',
      professionalTitle: data.professionalTitle,
      company: data.company,
      industry: data.industry,
      yearsProfessionalExperience: data.yearsProfessionalExperience,
      areasOfExpertise: data.areasOfExpertise.split(',').map(s => s.trim()).filter(s => s),
      mentoringAvailability: data.mentoringAvailability,
      mentoringCommunication: data.mentoringCommunication,
      mentoringMotivation: data.mentoringMotivation,
    };
    login(mentorUser);
    toast({
      title: "Registration Successful!",
      description: `Welcome, ${data.name}! You are now registered as a Mentor.`,
      variant: "default",
    });
    router.push('/dashboard/mentor');
  };

  return (
    <RegistrationFormWrapper
      title="Mentor Registration"
      description="Join us to guide veterans in their civilian career transition. Your experience matters."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>
             <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Professional Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="professionalTitle">Current Job Title</Label>
              <Input id="professionalTitle" {...register('professionalTitle')} />
              {errors.professionalTitle && <p className="text-destructive text-sm mt-1">{errors.professionalTitle.message}</p>}
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register('company')} />
              {errors.company && <p className="text-destructive text-sm mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register('industry')} />
              {errors.industry && <p className="text-destructive text-sm mt-1">{errors.industry.message}</p>}
            </div>
            <div>
              <Label htmlFor="yearsProfessionalExperience">Years of Professional Experience</Label>
              <Input id="yearsProfessionalExperience" type="number" {...register('yearsProfessionalExperience')} />
              {errors.yearsProfessionalExperience && <p className="text-destructive text-sm mt-1">{errors.yearsProfessionalExperience.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="areasOfExpertise">Areas of Expertise (comma-separated)</Label>
              <Input id="areasOfExpertise" {...register('areasOfExpertise')} placeholder="e.g., Software Engineering, Marketing, Finance" />
              {errors.areasOfExpertise && <p className="text-destructive text-sm mt-1">{errors.areasOfExpertise.message}</p>}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Mentoring Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mentoringAvailability">Availability for Mentoring</Label>
              <Input id="mentoringAvailability" {...register('mentoringAvailability')} placeholder="e.g., 2 hours/week, evenings" />
            </div>
            <div>
              <Label htmlFor="mentoringCommunication">Preferred Communication Methods</Label>
              <Input id="mentoringCommunication" {...register('mentoringCommunication')} placeholder="e.g., Email, Video Call" />
            </div>
          </div>
           <div className="mt-4">
              <Label htmlFor="mentoringMotivation">Motivation for Mentoring</Label>
              <Textarea id="mentoringMotivation" {...register('mentoringMotivation')} placeholder="Why do you want to mentor veterans?" />
              {errors.mentoringMotivation && <p className="text-destructive text-sm mt-1">{errors.mentoringMotivation.message}</p>}
            </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Register as Mentor</Button>
      </form>
    </RegistrationFormWrapper>
  );
}
