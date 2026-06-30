
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { SunIcon, MoonStarIcon } from '../icons/Icons';

const ThemeToggleSwitch: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green dark:focus:ring-offset-dark-card ${isDark ? 'bg-slate-950' : 'bg-slate-300'
                }`}
            style={{
                display: 'inline-flex',
                overflow: 'hidden',
                boxSizing: 'border-box',
                position: 'relative',
                flexShrink: 0,
                zIndex: 0,
                verticalAlign: 'middle',
                alignItems: 'center',
                width: '50px',
                height: '26px',
                padding: '4px'
            }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <span
                className={`transition-transform duration-300 ease-in-out transform ${isDark ? 'translate-x-[26px]' : 'translate-x-0'
                    } inline-flex rounded-full shadow-md items-center justify-center ${isDark ? 'bg-slate-300' : 'bg-white'
                    }`}
                style={{ width: '20px', height: '20px' }}
            >
                {isDark ? (
                    <MoonStarIcon className="h-3.5 w-3.5 text-slate-800" />
                ) : (
                    <SunIcon className="h-3.5 w-3.5 text-yellow-500" />
                )}
            </span>
        </button>
    );
};

export default ThemeToggleSwitch;
