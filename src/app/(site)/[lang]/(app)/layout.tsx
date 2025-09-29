import React from 'react';
import SidebarLayout from '@/components/Sidebar/SidebarLayout';
import Particles from '@/components/ui/particles';
import BgGlassmorphism from '@/components/BgGlassmorphism';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    name: 'Emon Pixels',
    email: 'emon683@nogl.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  return (
    <SidebarLayout user={user}>
      <div className="min-h-screen relative overflow-hidden">
        <Particles
          className="absolute inset-0 -z-10"
          quantity={3000}
          ease={70}
          size={0.5}
          staticity={40}
          color="#4F46E5"
        />
        <BgGlassmorphism />
        <main className="flex-1 relative z-10">
          {children}
        </main>
      </div>
    </SidebarLayout>
  );
}
