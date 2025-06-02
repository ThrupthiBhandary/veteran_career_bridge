import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Building, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const features = [
    "AI-Powered Skill Mapping",
    "Targeted Job Board",
    "Mentorship Connections",
    "Employer Partnerships"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <section className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4 text-left">
              <div className="space-y-2">
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  Veteran Career Bridge
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl font-body">
                  Connecting military talent with civilian opportunities. Your next mission starts here.
                </p>
              </div>
              <ul className="grid gap-2 py-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center font-body">
                    <CheckCircle className="mr-2 h-5 w-5 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/#register" passHref>
                  <Button size="lg" className="w-full min-[400px]:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Veterans in new careers"
              data-ai-hint="veterans professionals"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
            />
          </div>
        </div>
      </section>

      <section id="register" className="w-full py-12 md:py-20 lg:py-28 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl text-primary">Join Our Community</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                Select your role to begin your journey with Veteran Career Bridge.
                We provide tailored resources and opportunities for veterans, mentors, and employers.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-3 md:gap-12 lg:gap-16 pt-12">
            <RoleCard
              icon={<Briefcase className="h-10 w-10 text-primary" />}
              title="I am a Veteran"
              description="Find new career paths, get skill assessments, and connect with employers and mentors."
              link="/register/veteran"
              actionText="Register as Veteran"
            />
            <RoleCard
              icon={<Users className="h-10 w-10 text-primary" />}
              title="I am a Mentor"
              description="Guide veterans in their career transition, share your expertise, and make a difference."
              link="/register/mentor"
              actionText="Register as Mentor"
            />
            <RoleCard
              icon={<Building className="h-10 w-10 text-primary" />}
              title="I am an Employer"
              description="Post jobs, find skilled veteran talent, and showcase your commitment to the veteran community."
              link="/register/employer"
              actionText="Register as Employer"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  actionText: string;
}

function RoleCard({ icon, title, description, link, actionText }: RoleCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="items-center">
        {icon}
        <CardTitle className="mt-4 text-2xl font-headline text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-center font-body text-foreground/70">
          {description}
        </CardDescription>
      </CardContent>
      <div className="p-6 pt-0">
        <Link href={link} passHref>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">{actionText}</Button>
        </Link>
      </div>
    </Card>
  );
}
