import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141517] to-[#1a1b1e] text-white">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="transition-all duration-300 lg:pl-20 pt-32">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1920px] animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};