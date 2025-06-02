'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface RegistrationFormWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function RegistrationFormWrapper({ title, description, children }: RegistrationFormWrapperProps) {
  return (
    <div className="flex justify-center items-center py-8 md:py-12">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">{title}</CardTitle>
          <CardDescription className="font-body text-lg text-foreground/80">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
