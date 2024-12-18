import React, { useRef, useEffect, useState } from 'react';
import { Menu, Home, LogOut } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { DateRangeSelector } from './DateRangeSelector';
import { useFilters } from '../contexts/FilterContext';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { dateRange, setDateRange } = useFilters();
  const { signOut } = useFirebaseAuth();
  const headerRef = useRef<HTMLDivElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeDown = distance < -minSwipeDistance;
    const isSwipeUp = distance > minSwipeDistance;
    
    if (isSwipeDown) {
      setIsHidden(false);
    } else if (isSwipeUp) {
      setIsHidden(true);
    }
  };

  useEffect(() => {
    const header = headerRef.current;
    if (header) {
      header.addEventListener('touchstart', onTouchStart);
      header.addEventListener('touchmove', onTouchMove);
      header.addEventListener('touchend', onTouchEnd);

      return () => {
        header.removeEventListener('touchstart', onTouchStart);
        header.removeEventListener('touchmove', onTouchMove);
        header.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [touchStart, touchEnd]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 right-0 left-0 z-50 transition-transform duration-300 ease-out
                 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="bg-[#1a1b1e]/95 border-b border-gray-800/50 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between p-4 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              className="p-2.5 rounded-lg bg-[#25262b] text-gray-300 hover:text-white 
                       hover:bg-[#2d2e33] active:bg-[#33343a] transition-colors
                       border border-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <Link
              to="/"
              className="p-2.5 rounded-lg bg-[#25262b] text-gray-300 hover:text-white 
                       hover:bg-[#2d2e33] active:bg-[#33343a] transition-colors
                       border border-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <Home size={20} />
            </Link>
            <GoogleAuthButton compact />
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg bg-[#25262b] text-gray-300 hover:text-white 
                       hover:bg-[#2d2e33] active:bg-[#33343a] transition-colors
                       border border-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          <DateRangeSelector selectedRange={dateRange} onChange={setDateRange} />
        </div>
      </div>
    </header>
  );
};