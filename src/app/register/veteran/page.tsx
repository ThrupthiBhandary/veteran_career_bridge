
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import RegistrationFormWrapper from '@/components/auth/RegistrationFormWrapper';
import { COMMON_SKILLS, MILITARY_BRANCHES } from '@/lib/constants';
import type { User } from '@/types';
import { useToast } from "@/hooks/use-toast";

const veteranSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  militaryBranch: z.string().min(1, "Branch is required"),
  rank: z.string().min(1, "Rank is required"),
  mos: z.string().optional(),
  yearsOfService: z.coerce.number().min(0, "Years of service cannot be negative").optional(),
  militaryExperienceSummary: z.string().optional(),
  selectedSkills: z.array(z.string()).optional().default([]),
  customSkills: z.string().optional(),
  desiredIndustry: z.string().optional(),
  desiredJobTitle: z.string().optional(),
  locationPreference: z.string().optional(),
  employmentType: z.string().optional(),
});

type VeteranFormData = z.infer<typeof veteranSchema>;

export default function VeteranRegistrationPage() {
  const { login } = useAppContext(); // login is for new registrations
  const router = useRouter();
  const { toast } = useToast();
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);

  const { control, handleSubmit, register, watch, setValue, formState: { errors } } = useForm<VeteranFormData>({
    resolver: zodResolver(veteranSchema),
    defaultValues: {
      selectedSkills: [],
    }
  });

  const onSubmit = (data: VeteranFormData) => {
    const allSkills = [...data.selectedSkills];
    if (data.customSkills) {
      allSkills.push(...data.customSkills.split(',').map(s => s.trim()).filter(s => s));
    }

    const veteranUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: data.name,
      email: data.email,
      role: 'veteran',
      militaryBranch: data.militaryBranch,
      rank: data.rank,
      mos: data.mos,
      yearsOfService: data.yearsOfService,
      militaryExperienceSummary: data.militaryExperienceSummary,
      skills: allSkills,
      desiredIndustry: data.desiredIndustry?.split(',').map(s => s.trim()).filter(s => s),
      desiredJobTitle: data.desiredJobTitle?.split(',').map(s => s.trim()).filter(s => s),
      locationPreference: data.locationPreference,
      employmentType: data.employmentType,
    };
    
    const registrationSuccess = login(veteranUser); // login now returns boolean
    if (registrationSuccess) {
      toast({
        title: "Registration Successful!",
        description: `Welcome, ${data.name}! You are now registered as a Veteran.`,
        variant: "default",
      });
      router.push('/dashboard/veteran');
    }
    // If registration fails (e.g. email exists), the toast is handled by AppContext.login
  };

  const selectedSkills = watch('selectedSkills');

  return (
    <RegistrationFormWrapper
      title="Veteran Registration"
      description="Share your military experience and career goals to find the best opportunities."
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
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Military Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="militaryBranch">Branch of Service</Label>
              <Controller
                name="militaryBranch"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>
                      {MILITARY_BRANCHES.map(branch => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.militaryBranch && <p className="text-destructive text-sm mt-1">{errors.militaryBranch.message}</p>}
            </div>
            <div>
              <Label htmlFor="rank">Rank</Label>
              <Input id="rank" {...register('rank')} />
              {errors.rank && <p className="text-destructive text-sm mt-1">{errors.rank.message}</p>}
            </div>
            <div>
              <Label htmlFor="mos">MOS/Specialty</Label>
              <Input id="mos" {...register('mos')} />
            </div>
             <div>
              <Label htmlFor="yearsOfService">Years of Service</Label>
              <Input id="yearsOfService" type="number" {...register('yearsOfService')} />
              {errors.yearsOfService && <p className="text-destructive text-sm mt-1">{errors.yearsOfService.message}</p>}
            </div>
          </div>
           <div className="mt-4">
              <Label htmlFor="militaryExperienceSummary">Summary of Military Experience</Label>
              <Textarea id="militaryExperienceSummary" {...register('militaryExperienceSummary')} placeholder="Describe your key achievements and responsibilities..." />
            </div>
        </div>

        <div>
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Skills</h3>
          <Label>Select your skills (check all that apply):</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2 max-h-60 overflow-y-auto p-2 border rounded-md">
            {COMMON_SKILLS.map(skill => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={(checked) => {
                    const currentSkills = selectedSkills || [];
                    if (checked) {
                      setValue('selectedSkills', [...currentSkills, skill]);
                    } else {
                      setValue('selectedSkills', currentSkills.filter(s => s !== skill));
                    }
                  }}
                />
                <Label htmlFor={`skill-${skill}`} className="font-normal">{skill}</Label>
              </div>
            ))}
             <div className="flex items-center space-x-2 col-span-full mt-2">
                <Checkbox
                  id="skill-other"
                  checked={showCustomSkillInput}
                  onCheckedChange={(checked) => setShowCustomSkillInput(!!checked)}
                />
                <Label htmlFor="skill-other" className="font-normal">Other skills (please specify)</Label>
              </div>
          </div>
          {showCustomSkillInput && (
            <div className="mt-2">
              <Label htmlFor="customSkills">Custom Skills (comma-separated)</Label>
              <Input id="customSkills" {...register('customSkills')} placeholder="e.g., Advanced Welding, Drone Piloting" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium font-headline text-primary mb-2">Career Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="desiredIndustry">Desired Industry(s) (comma-separated)</Label>
              <Input id="desiredIndustry" {...register('desiredIndustry')} placeholder="e.g., Technology, Logistics, Healthcare" />
            </div>
            <div>
              <Label htmlFor="desiredJobTitle">Desired Job Title(s) (comma-separated)</Label>
              <Input id="desiredJobTitle" {...register('desiredJobTitle')} placeholder="e.g., Project Manager, Analyst" />
            </div>
            <div>
              <Label htmlFor="locationPreference">Location Preference</Label>
              <Input id="locationPreference" {...register('locationPreference')} placeholder="e.g., Austin, TX or Remote" />
            </div>
            <div>
              <Label htmlFor="employmentType">Type of Employment</Label>
               <Controller
                name="employmentType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select Employment Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Register as Veteran</Button>
      </form>
    </RegistrationFormWrapper>
  );
}
