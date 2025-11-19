"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityDashboard } from "@/components/dashboard/activity-dashboard";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-background">
      <ActivityDashboard />
    </main>
  );
}
