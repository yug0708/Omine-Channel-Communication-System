
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { PasswordEyeIcon, PasswordEyeOffIcon } from '../icons/Icons';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordInput: React.FC<{
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}> = ({ id, value, onChange, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                name={id}
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-dark-bg rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 border-2 border-slate-200 dark:border-slate-700 focus:border-primary-500"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <PasswordEyeOffIcon className="h-6 w-6" /> : <PasswordEyeIcon className="h-6 w-6" />}
            </button>
        </div>
    );
};


const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    try {
      await changePassword(newPassword);
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change password">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PasswordInput
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
        />
        <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
        />

        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center font-medium">{success}</p>}
        
        <div className="pt-2 flex justify-end">
            <Button 
                variant="outline"
                type="submit" 
                disabled={isLoading}
            >
                {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
