
import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CameraIcon, PencilIcon } from '../components/icons/Icons';

const UserProfile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(currentUser?.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert('File is too large. Max size is 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      profilePicture: profileImage || undefined,
    });
    alert('Profile updated successfully!');
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const InputField = ({ label, name, value, onChange, disabled = false, type = 'text' }: any) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`mt-1 block w-full rounded-md bg-slate-100 dark:bg-dark-bg border-slate-300 dark:border-slate-600 focus:border-accent-green focus:ring-accent-green ${disabled ? 'text-slate-400 dark:text-slate-400 cursor-not-allowed' : 'text-slate-900 dark:text-white'}`}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <form onSubmit={handleSubmit}>
        <Card className="p-0">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold">User Profile</h2>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Photo uploader */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative w-40 h-40">
                <div
                  className="w-40 h-40 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center bg-slate-100 dark:bg-dark-bg cursor-pointer hover:border-accent-green transition-colors"
                  onClick={triggerFileSelect}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <>
                      <CameraIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                      <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload Photo</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="absolute bottom-2 right-2 bg-accent-green text-white h-8 w-8 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept=".jpeg, .jpg, .png"
              />
              <span className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">ACTIVE</span>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 text-center">
                Allowed *.jpeg, *.jpg, *.png<br />max size of 3MB
              </p>
            </div>

            {/* Right side: Form fields */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                <div className="md:col-span-2">
                    <InputField label="Email address" name="email" value={currentUser?.email || ''} disabled={true} />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default UserProfile;
