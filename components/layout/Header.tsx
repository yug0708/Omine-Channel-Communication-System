import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

import ThemeToggleSwitch from '../ui/ThemeToggleSwitch';
import Button from '../ui/Button';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import NotificationsDropdown from './NotificationsDropdown';
import LanguageDropdown from './LanguageDropdown';

import {
  UKFlagIcon,
  BellIcon,
  RefreshIcon,
  UCLogo
} from '../icons/Icons';

const Header: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState(false);

  const [isNotificationsOpen, setNotificationsOpen] =
    useState(false);

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] =
    useState(false);

  const [isChangePasswordModalOpen, setChangePasswordModalOpen] =
    useState(false);

  const profileDropdownRef =
    useRef<HTMLDivElement>(null);

  const notificationsRef =
    useRef<HTMLDivElement>(null);

  const languageDropdownRef =
    useRef<HTMLDivElement>(null);

  const { logout, currentUser } = useAuth();

  const { notifications, setNotifications } =
    useData();

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsProfileDropdownOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(
          event.target as Node
        )
      ) {
        setNotificationsOpen(false);
      }

      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const userInitial = currentUser?.firstName
    ? currentUser.firstName.charAt(0).toUpperCase()
    : 'U';

  const userName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : 'User';

  const userEmail =
    currentUser?.email || 'user@example.com';

  const organizationName =
    currentUser?.organizationName ||
    'My Organization';

  const profilePicture =
    currentUser?.profilePicture;

  return (
    <>
      <header className="relative z-20 bg-white dark:bg-slate-900 shadow-sm p-4 flex justify-between items-center border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden pr-2">
          <div className="flex-shrink-0">
            <UCLogo className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>

          <h1 className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {organizationName}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4 text-slate-600 dark:text-slate-300 flex-shrink-0">
          <ThemeToggleSwitch />

          <div
            className="relative"
            ref={languageDropdownRef}
          >
            <button
              onClick={() =>
                setIsLanguageDropdownOpen(
                  (prev) => !prev
                )
              }
              className="p-1 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <UKFlagIcon className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
            </button>

            <LanguageDropdown
              isOpen={isLanguageDropdownOpen}
            />
          </div>

          <div
            className="relative flex-shrink-0"
            ref={notificationsRef}
          >
            <button
              onClick={() =>
                setNotificationsOpen(
                  (prev) => !prev
                )
              }
              className="p-1 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}

            <NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() =>
                setNotificationsOpen(false)
              }
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>

          <div
            className="relative flex-shrink-0"
            ref={profileDropdownRef}
          >
            <button
              onClick={() =>
                setIsProfileDropdownOpen(
                  !isProfileDropdownOpen
                )
              }
              className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-500 text-white font-bold text-base sm:text-xl overflow-hidden shadow-sm"
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial
              )}
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500 text-white font-bold text-xl overflow-hidden">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {userName}
                      </p>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <span>
                      Webphone:{' '}
                      <span className="text-green-400">
                        ●
                      </span>{' '}
                      Disconnected
                    </span>

                    <button className="ml-2 hover:text-slate-800 dark:hover:text-white">
                      <RefreshIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() =>
                      setIsProfileDropdownOpen(
                        false
                      )
                    }
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    User Profile
                  </Link>

                  <button
                    onClick={() => {
                      setChangePasswordModalOpen(
                        true
                      );

                      setIsProfileDropdownOpen(
                        false
                      );
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Change password
                  </button>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="primary"
                    className="w-full"
                  >
                    Buy now
                  </Button>
                </div>

                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-accent-orange hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() =>
          setChangePasswordModalOpen(false)
        }
      />
    </>
  );
};

export default Header;
