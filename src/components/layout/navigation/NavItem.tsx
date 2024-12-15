import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  onMobileClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  isCollapsed,
  onMobileClick 
}) => {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onMobileClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
         hover:bg-[#25262b] group
         ${isActive 
           ? 'bg-blue-500/10 text-blue-400' 
           : 'text-gray-400 hover:text-white'}`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <span className="truncate font-medium">{label}</span>
      )}
      {isCollapsed && (
        <div className="fixed left-14 ml-4 px-2 py-1 bg-gray-900 rounded-md 
                      text-white text-sm opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 pointer-events-none">
          {label}
        </div>
      )}
    </NavLink>
  );
};