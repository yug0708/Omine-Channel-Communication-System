
import React from 'react';
import { Notification } from '../../types';
import { CheckAllIcon, CloseIcon } from '../icons/Icons';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");

    return "just now";
};


const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose, notifications, setNotifications }) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  }

  const handleMarkOneRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20">
      <div className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
        <div className="flex items-center space-x-2">
            <button onClick={handleMarkAllRead} className="text-green-500 hover:text-green-600 dark:hover:text-green-400 p-1" title="Mark all as read">
                <CheckAllIcon className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1" title="Close">
                <CloseIcon className="h-5 w-5" />
            </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
            notifications.map((notif) => (
                <div key={notif.id} onClick={() => handleMarkOneRead(notif.id)} className="flex items-start p-3 border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${notif.avatarColor} text-white flex items-center justify-center font-bold text-lg`}>
                        {notif.userInitial}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">{notif.userName}</span> {notif.action.split(notif.userName)[1] || notif.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatDistanceToNow(notif.timestamp)}
                        </p>
                    </div>
                    {!notif.read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 ml-3 mt-1 flex-shrink-0"></div>
                    )}
                </div>
            ))
        ) : (
            <p className="text-center p-8 text-slate-500 dark:text-slate-400">No new notifications</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;