import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Moon, Sun, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function Settings() {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user?.user_metadata?.full_name || 'User'}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="fullName"
                  type="text"
                  value={user?.user_metadata?.full_name || ''}
                  readOnly
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Update Profile
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {darkMode ? <Moon className="w-5 h-5 text-gray-600 mr-3" /> : <Sun className="w-5 h-5 text-gray-600 mr-3" />}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Theme</h3>
                <p className="text-sm text-gray-600">Choose your preferred theme</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-600">Get notified about habit reminders</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Updates</h3>
                <p className="text-sm text-gray-600">Receive weekly progress reports</p>
              </div>
            </div>
            <button
              onClick={() => setEmailUpdates(!emailUpdates)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailUpdates ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
        
        <div className="space-y-4">
          <button className="flex items-center px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
            <Lock className="w-5 h-5 mr-3" />
            Change Password
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
        <p className="text-red-700 text-sm mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}