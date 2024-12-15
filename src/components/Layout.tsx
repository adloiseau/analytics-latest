import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#141517] text-white">
      <Header />
      <Sidebar />
      <div className="transition-all duration-300 pl-16 lg:pl-64 p-6 pt-20">
        {children}
      </div>
    </div>
  );
};