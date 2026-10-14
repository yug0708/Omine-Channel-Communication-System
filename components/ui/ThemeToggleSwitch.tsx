import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleSwitchProps {
    className?: string;
}

const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`
                relative group flex items-center justify-center
                h-8 w-8 sm:h-9 sm:w-9 rounded-xl
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-1 focus:ring-offset-transparent
                ${isDark
                    ? 'bg-slate-900/90 hover:bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400/60 shadow-lg shadow-emerald-500/15'
                    : 'bg-white hover:bg-amber-50/70 border border-amber-300/80 hover:border-amber-400 shadow-md shadow-amber-400/20'
                }
                ${className}
            `}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Background Aura Glow */}
            <span
                className={`
                    absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
                    ${isDark
                        ? 'bg-emerald-500/15 blur-sm opacity-60 group-hover:opacity-100'
                        : 'bg-amber-400/20 blur-sm opacity-50 group-hover:opacity-90'
                    }
                `}
                aria-hidden="true"
            />

            {/* Icon with Smooth Rotation/Scale Transition */}
            <span className="relative z-10 flex items-center justify-center">
                {isDark ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.55)] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-45"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </span>
        </button>
    );
};

export default ThemeToggleSwitch;
