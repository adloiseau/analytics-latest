import React from 'react';
import { useSearchParams } from 'react-router-dom';

type ViewType = 'pages' | 'keywords' | 'countries';

interface ViewSelectorProps {
  onChange?: (view: ViewType) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ onChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = (searchParams.get('view') as ViewType) || 'pages';

  const handleViewChange = (view: ViewType) => {
    setSearchParams({ view });
    onChange?.(view);
  };

  return (
    <div className="flex bg-[#25262b] rounded-lg p-1 gap-1">
      <button
        onClick={() => handleViewChange('pages')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentView === 'pages'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-[#2d2e33]'
        }`}
      >
        Pages
      </button>
      <button
        onClick={() => handleViewChange('keywords')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentView === 'keywords'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-[#2d2e33]'
        }`}
      >
        Keywords
      </button>
      <button
        onClick={() => handleViewChange('countries')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentView === 'countries'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-[#2d2e33]'
        }`}
      >
        Pays
      </button>
    </div>
  );
};