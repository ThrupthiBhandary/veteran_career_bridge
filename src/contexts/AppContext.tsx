'use client';

import type { User, Job, Application, Role } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AppContextType {
  currentUser: User | null;
  jobs: Job[];
  applications: Application[];
  login: (user: User) => void;
  logout: () => void;
  addJob: (job: Omit<Job, 'id' | 'postedDate' | 'employerId' | 'employerName'>) => void;
  applyForJob: (jobId: string) => void;
  updateApplicationStatus: (jobId: string, status: Application['status']) => void;
  getJobsByEmployer: (employerId: string) => Job[];
  getApplicationsByVeteran: (veteranId: string) => Application[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'veteranCareerBridgeUser';
const LOCAL_STORAGE_KEY_JOBS = 'veteranCareerBridgeJobs';
const LOCAL_STORAGE_KEY_APPLICATIONS = 'veteranCareerBridgeApplications';


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    const storedJobs = localStorage.getItem(LOCAL_STORAGE_KEY_JOBS);
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
    const storedApplications = localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS);
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
  }, [currentUser, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY_JOBS, JSON.stringify(jobs));
  }, [jobs, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEY_APPLICATIONS, JSON.stringify(applications));
  }, [applications, isInitialized]);


  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    // Optionally clear jobs and applications or handle persistence
  };

  const addJob = (jobData: Omit<Job, 'id' | 'postedDate' | 'employerId' | 'employerName'>) => {
    if (!currentUser || currentUser.role !== 'employer') {
      console.error("Only employers can post jobs.");
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
      console.error("Only veterans can apply for jobs.");
      return;
    }
    if (applications.some(app => app.jobId === jobId && app.veteranId === currentUser.id)) {
      console.warn("Already applied for this job.");
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

  const updateApplicationStatus = (jobId: string, status: Application['status']) => {
     // Typically an employer action, simplified here
    setApplications(prevApps => prevApps.map(app => app.jobId === jobId ? {...app, status} : app));
  };
  
  const getJobsByEmployer = (employerId: string) => {
    return jobs.filter(job => job.employerId === employerId);
  };

  const getApplicationsByVeteran = (veteranId: string) => {
    return applications.filter(app => app.veteranId === veteranId);
  };


  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <AppContext.Provider value={{ 
        currentUser, 
        jobs, 
        applications, 
        login, 
        logout, 
        addJob, 
        applyForJob,
        updateApplicationStatus,
        getJobsByEmployer,
        getApplicationsByVeteran
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
