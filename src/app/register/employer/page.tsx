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
import RegistrationFormWrapper from '@/components/auth/RegistrationFormWrapper';
import type { User } from '@/types';
import { useToast } from "@/hooks/use-toast";

const employerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyIndustry: z.string().min(1, "Industry is required"),
  companyWebsite: z.string().url("Invalid website URL").optional().or(z.literal('')),
  companySize: z.string().optional(),
  companyDescription: z.string().optional(),
  contactPersonName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactPersonEmail: z.string().email('Invalid email address'),
  contactPersonJobTitle: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyLocations: z.string().optional(),
  hiringFocus: z.string().optional(),
});

type EmployerFormData = z.infer<typeof employerSchema>;

export default function EmployerRegistrationPage() {
  const { login } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const { handleSubmit, register, formState: { errors } } = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
  });

  const onSubmit = (data: EmployerFormData) => {
    const employerUser: User = {
      id: `user-${Date.now()}`,
      name: data.contactPersonName, // Primary contact person
      email: data.contactPersonEmail,
      role: 'employer',
      companyName: data.companyName,
      companyIndustry: data.companyIndustry,
      companyWebsite: data.companyWebsite,
      companySize: data.companySize,
      companyDescription: data.companyDescription,
      contactPersonJobTitle: data.contactPersonJobTitle,
      companyLocations: data.companyLocations?.split(',').map(s => s.trim()).filter(s => s),
      hiringFocus: data.hiringFocus,
    };
    login(employerUser);
    toast({
      title: "Registration Successful!",
      description: `Welcome, ${data.companyName}! You are now registered as an Employer.`,
      variant: "default",
    });
    router.push('/dashboard/employer');
  };

  return (
    <RegistrationFormWrapper
      title="Employer Registration"
      description="Join our platform to connect with skilled veterans and diversify your workforce."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...register('companyName')} />
              {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyIndustry">Industry</Label>
              <Input id="companyIndustry" {...register('companyIndustry')} />
              {errors.companyIndustry && <p className="text-destructive text-sm mt-1">{errors.companyIndustry.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input id="companyWebsite" {...register('companyWebsite')} />
              {errors.companyWebsite && <p className="text-destructive text-sm mt-1">{errors.companyWebsite.message}</p>}
            </div>
            <div>
              <Label htmlFor="companySize">Company Size</Label>
              <Input id="companySize" {...register('companySize')} placeholder="e.g., 1-50, 51-200, 200+" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea id="companyDescription" {...register('companyDescription')} placeholder="Tell us about your company..." />
            </div>
             <div>
              <Label htmlFor="companyLocations">Company Locations (comma-separated)</Label>
              <Input id="companyLocations" {...register('companyLocations')} placeholder="e.g., New York, Remote" />
            </div>
             <div>
              <Label htmlFor="hiringFocus">Hiring Focus (e.g., tech roles, veterans preferred)</Label>
              <Input id="hiringFocus" {...register('hiringFocus')} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Employer Contact Person</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPersonName">Full Name</Label>
              <Input id="contactPersonName" {...register('contactPersonName')} />
              {errors.contactPersonName && <p className="text-destructive text-sm mt-1">{errors.contactPersonName.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactPersonEmail">Email Address</Label>
              <Input id="contactPersonEmail" type="email" {...register('contactPersonEmail')} />
              {errors.contactPersonEmail && <p className="text-destructive text-sm mt-1">{errors.contactPersonEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactPersonJobTitle">Job Title</Label>
              <Input id="contactPersonJobTitle" {...register('contactPersonJobTitle')} />
            </div>
             <div>
              <Label htmlFor="password">Account Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Register as Employer</Button>
      </form>
    </RegistrationFormWrapper>
  );
}
