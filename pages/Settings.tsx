import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { UserCircleIcon, LockIcon, ThemeToggleIcon, BellIcon } from '../components/icons/Icons';
import ThemeToggleSwitch from '../components/ui/ThemeToggleSwitch';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';

const Settings: React.FC = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; }> = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`${
        enabled ? 'bg-accent-green' : 'bg-slate-200 dark:bg-slate-600'
      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-card focus:ring-accent-green`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
      />
    </button>
  );

  const labelClasses = "block text-sm font-medium text-slate-600 dark:text-slate-400";
  const disabledInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 cursor-not-allowed";
  const sectionClasses = "flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-bg rounded-lg";


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Profile, password, theme, and notifications.</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <div className="flex items-center mb-6">
          <UserCircleIcon className="h-8 w-8 text-slate-500 dark:text-slate-400 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Profile</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage your personal information.</p>
          </div>
        </div>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={labelClasses}>Full Name</label>
              <input type="text" name="name" id="name" defaultValue={currentUser ? `${currentUser.firstName} ${currentUser.lastName}`: ''} disabled className={disabledInputClasses} />
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>Email Address</label>
              <input type="email" name="email" id="email" defaultValue={currentUser?.email || ''} disabled className={disabledInputClasses} />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button disabled>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Password Settings */}
      <Card>
        <div className="flex items-center mb-6">
          <LockIcon className="h-8 w-8 text-slate-500 dark:text-slate-400 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Password</h2>
            <p className="text-slate-500 dark:text-slate-400">Update your password for better security.</p>
          </div>
        </div>
        <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setChangePasswordModalOpen(true)}>Change Password</Button>
        </div>
      </Card>
      
      {/* Theme Settings */}
      <Card>
        <div className="flex items-center mb-4">
          <ThemeToggleIcon className="h-8 w-8 text-slate-500 dark:text-slate-400 mr-4" />
          <div>
            <h2 className="text-xl font-semibold">Theme</h2>
            <p className="text-slate-500 dark:text-slate-400">Customize the look and feel of the dashboard.</p>
          </div>
        </div>
        <div className={sectionClasses}>
          <span className="font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          <ThemeToggleSwitch />
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center mb-6">
            <BellIcon className="h-8 w-8 text-slate-500 dark:text-slate-400 mr-4" />
            <div>
                <h2 className="text-xl font-semibold">Notifications</h2>
                <p className="text-slate-500 dark:text-slate-400">Control how you receive notifications from us.</p>
            </div>
        </div>
        <div className="space-y-4">
            <div className={sectionClasses}>
                <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive important updates and summaries via email.</p>
                </div>
                <ToggleSwitch enabled={true} onChange={() => {}} />
            </div>
            <div className={sectionClasses}>
                 <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-slate-400">Get real-time alerts in your browser.</p>
                </div>
                <ToggleSwitch enabled={false} onChange={() => {}} />
            </div>
        </div>
      </Card>

      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Settings;