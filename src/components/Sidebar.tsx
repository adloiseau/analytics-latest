import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Search, X } from 'lucide-react';
import { NavItem } from './layout/navigation/NavItem';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const navItems = [
    { to: '/top-pages', icon: FileText, label: 'Top Pages' },
    { to: '/top-queries', icon: Search, label: 'Top Queries' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 z-[60]
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-[72px] h-[calc(100vh-72px)] bg-[#1a1b1e]/95 backdrop-blur-sm border-r border-gray-800/50 
                   shadow-xl transition-all duration-300 z-[70] w-[280px]
                   ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-4 p-2 rounded-lg bg-[#25262b] text-gray-400 
                   hover:text-white hover:bg-[#2d2e33] transition-colors lg:hidden
                   border border-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Fermer le menu"
        >
          <X size={20} />
        </button>
        
        <nav className="p-3">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavItem
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isCollapsed={!isOpen}
                  onMobileClick={onClose}
                />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};