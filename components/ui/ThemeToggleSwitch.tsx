
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { SunIcon, MoonStarIcon } from '../icons/Icons';

const ThemeToggleSwitch: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex flex-shrink-0 items-center h-7 w-14 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green dark:focus:ring-offset-dark-card ${
                isDark ? 'bg-slate-950' : 'bg-slate-300'
            }`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <span
                className={`absolute left-0.5 transition-transform duration-300 ease-in-out transform ${
                    isDark ? 'translate-x-7' : 'translate-x-0'
                } inline-block w-6 h-6 rounded-full shadow-md flex items-center justify-center ${
                    isDark ? 'bg-slate-300' : 'bg-white'
                }`}
            >
                {isDark ? (
                    <MoonStarIcon className="h-4 w-4 text-slate-800" />
                ) : (
                    <SunIcon className="h-4 w-4 text-yellow-500" />
                )}
            </span>
        </button>
    );
};

export default ThemeToggleSwitch;
