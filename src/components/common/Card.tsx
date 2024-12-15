import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-[#25262b] rounded-lg p-6 ${className}`}>
    {children}
  </div>
);