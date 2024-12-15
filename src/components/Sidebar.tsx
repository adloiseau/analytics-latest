import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`bg-[#1a1b1e] h-screen fixed left-0 top-0 pt-16 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 bg-[#25262b] rounded-full p-1 text-gray-400 hover:text-white"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#25262b] text-white'
                    : 'text-gray-400 hover:bg-[#25262b] hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              {!isCollapsed && <span>Overview</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/top-pages"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#25262b] text-white'
                    : 'text-gray-400 hover:bg-[#25262b] hover:text-white'
                }`
              }
            >
              <FileText className="w-5 h-5" />
              {!isCollapsed && <span>Top Pages</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/top-queries"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#25262b] text-white'
                    : 'text-gray-400 hover:bg-[#25262b] hover:text-white'
                }`
              }
            >
              <Search className="w-5 h-5" />
              {!isCollapsed && <span>Top Queries</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};