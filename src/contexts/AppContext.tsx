
'use client';

import type { User, Job, Application, Role } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  currentUser: User | null;
  users: User[]; // Store all registered users
  jobs: Job[];
  applications: Application[];
  login: (user: User) => boolean; // For new registrations, returns true on success
  attemptLogin: (email: string, role: Role) => User | null; // For signing in
  logout: () => void;
  addJob: (job: Omit<Job, 'id' | 'postedDate' | 'employerId' | 'employerName'>) => void;
  applyForJob: (jobId: string) => void;
  updateApplicationStatus: (jobId: string, veteranId: string, status: Application['status']) => void;
  getJobsByEmployer: (employerId: string) => Job[];
  getApplicationsByVeteran: (veteranId: string) => Application[];
  getApplicationsByJobId: (jobId: string) => Application[];
  getUserById: (userId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CURRENT_USER = 'veteranCareerBridgeCurrentUser';
const LOCAL_STORAGE_KEY_ALL_USERS = 'veteranCareerBridgeAllUsers';
const LOCAL_STORAGE_KEY_JOBS = 'veteranCareerBridgeJobs';
const LOCAL_STORAGE_KEY_APPLICATIONS = 'veteranCareerBridgeApplications';


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedCurrentUser = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    if (storedCurrentUser) {
      try {
        setCurrentUser(JSON.parse(storedCurrentUser));
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_USER);
      }
    }
    const storedAllUsers = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_USERS);
    if (storedAllUsers) {
       try {
        setUsers(JSON.parse(storedAllUsers));
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_ALL_USERS);
      }
    }
    const storedJobs = localStorage.getItem(LOCAL_STORAGE_KEY_JOBS);
    if (storedJobs) {
       try {
        setJobs(JSON.parse(storedJobs));
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_JOBS);
      }
    }
    const storedApplications = localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS);
    if (storedApplications) {
      try {
        setApplications(JSON.parse(storedApplications));
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_APPLICATIONS);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_USERS, JSON.stringify(users));
  }, [users, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY_JOBS, JSON.stringify(jobs));
  }, [jobs, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY_APPLICATIONS, JSON.stringify(applications));
  }, [applications, isInitialized]);


  const login = (newUser: User): boolean => { // For new registrations
    if (users.find(u => u.email === newUser.email)) {
      toast({
        title: "Registration Failed",
        description: "This email is already registered. Please log in.",
        variant: "destructive",
      });
      return false;
    }
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const attemptLogin = (email: string, role: Role): User | null => {
    const foundUser = users.find(u => u.email === email && u.role === role);
    if (foundUser) {
      setCurrentUser(foundUser);
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${foundUser.name}!`,
      });
      return foundUser;
    }
    toast({
        title: "Login Failed",
        description: "User not found or role mismatch. Please check your credentials or register.",
        variant: "destructive",
      });
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate' | 'employerId' | 'employerName'>) => {
    if (!currentUser || currentUser.role !== 'employer') {
      toast({ title: "Action Denied", description: "Only employers can post jobs.", variant: "destructive" });
      return;
    }
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      employerId: currentUser.id,
      employerName: currentUser.companyName || currentUser.name,
      postedDate: new Date().toISOString(),
    };
    setJobs(prevJobs => [...prevJobs, newJob]);
  };

  const applyForJob = (jobId: string) => {
    if (!currentUser || currentUser.role !== 'veteran') {
      toast({ title: "Action Denied", description: "Only veterans can apply for jobs.", variant: "destructive" });
      return;
    }
    if (applications.some(app => app.jobId === jobId && app.veteranId === currentUser.id)) {
      toast({ title: "Already Applied", description: "You have already applied for this job.", variant: "default" });
      return;
    }
    const newApplication: Application = {
      jobId,
      veteranId: currentUser.id,
      status: 'Applied',
      appliedDate: new Date().toISOString(),
    };
    setApplications(prevApplications => [...prevApplications, newApplication]);
  };

  const updateApplicationStatus = (jobId: string, veteranId: string, status: Application['status']) => {
    setApplications(prevApps => 
      prevApps.map(app => 
        app.jobId === jobId && app.veteranId === veteranId ? {...app, status} : app
      )
    );
    toast({
        title: "Application Updated",
        description: `Status changed to ${status}.`,
    });
  };
  
  const getJobsByEmployer = (employerId: string) => {
    return jobs.filter(job => job.employerId === employerId);
  };

  const getApplicationsByVeteran = (veteranId: string) => {
    return applications.filter(app => app.veteranId === veteranId);
  };

  const getApplicationsByJobId = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId);
  };

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };


  if (!isInitialized) {
    // You might want to return a loading spinner here
    return <div className="flex justify-center items-center h-screen"><p>Loading context...</p></div>;
  }

  return (
    <AppContext.Provider value={{ 
        currentUser, 
        users,
        jobs, 
        applications, 
        login, 
        attemptLogin,
        logout, 
        addJob, 
        applyForJob,
        updateApplicationStatus,
        getJobsByEmployer,
        getApplicationsByVeteran,
        getApplicationsByJobId,
        getUserById
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
