import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => (
  <div className="relative">
    <input
      className={`w-full px-4 py-2 bg-[#25262b]/50 border border-gray-700/50 rounded-lg 
                 text-sm text-gray-200 placeholder-gray-400 
                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                 transition-all ${className}`}
      {...props}
    />
    {icon && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
    )}
  </div>
);