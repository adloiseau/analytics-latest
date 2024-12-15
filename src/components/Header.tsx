import React from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';

export const Header = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-[#1a1b1e] border-b border-gray-800">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">Analytics Dashboard</h1>
        <div className="flex items-center bg-[#25262b] rounded-md px-3 py-1.5 cursor-pointer">
          <span className="text-gray-300 text-sm">Tous les sites</span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <GoogleAuthButton />
        <div className="flex items-center bg-[#25262b] rounded-md px-3 py-1.5 cursor-pointer">
          <span className="text-gray-300 text-sm">7 jours</span>
          <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
        </div>
        <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-200" />
      </div>
    </div>
  );
};