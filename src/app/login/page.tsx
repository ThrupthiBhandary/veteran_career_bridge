
'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role } from '@/types';
import { ROLES } from '@/lib/constants';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.custom<Role>(val => ROLES.some(r => r.value === val), "Role is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { attemptLogin, currentUser } = useAppContext();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    if (currentUser) {
      // Redirect if already logged in or after successful login
      switch (currentUser.role) {
        case 'veteran':
          router.push('/dashboard/veteran');
          break;
        case 'mentor':
          router.push('/dashboard/mentor');
          break;
        case 'employer':
          router.push('/dashboard/employer');
          break;
        default:
          router.push('/'); // Fallback
      }
    }
  }, [currentUser, router]);

  const onSubmit = (data: LoginFormData) => {
    attemptLogin(data.email, data.role);
    // Error toast is handled by attemptLogin in AppContext
    // Redirection will be handled by the useEffect hook monitoring currentUser
  };

  return (
    <div className="flex justify-center items-center py-8 md:py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Login</CardTitle>
          <CardDescription className="font-body text-lg text-foreground/80">
            Access your Veteran Career Bridge account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...control.register('email')} />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="role">Login as</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.filter(r => r.value !== null).map(role => (
                        <SelectItem key={role.value} value={role.value!}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-destructive text-sm mt-1">{errors.role.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Login</Button>
             <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/#register" className="font-medium text-primary hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
