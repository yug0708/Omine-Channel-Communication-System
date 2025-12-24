import React from 'react';
import { UKFlagIcon } from '../icons/Icons';

interface LanguageDropdownProps {
  isOpen: boolean;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 p-2">
      <ul>
        <li>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold">
            <UKFlagIcon className="h-5 w-5 rounded-sm" />
            <span>English</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default LanguageDropdown;
