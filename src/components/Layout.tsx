import React, { useState } from 'react';
import { Target, Calendar, Settings, LogOut, Menu, X, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'calendar' | 'settings';
  onTabChange: (tab: 'dashboard' | 'calendar' | 'settings') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isGuest, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success(isGuest ? 'Guest session ended' : 'Signed out successfully');
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Target },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'settings', name: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
  ${sidebarOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full'}
  lg:static lg:translate-x-0`}>

        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">KeepMeOnTrack</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Guest Mode Banner */}
        {isGuest && (
          <div className="mx-3 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <UserCheck className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800">Guest Mode</p>
                <p className="text-xs text-amber-700">Demo data only</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isGuest ? 'bg-amber-100' : 'bg-indigo-100'
            }`}>
              <span className={`font-medium ${isGuest ? 'text-amber-600' : 'text-indigo-600'}`}>
                {isGuest ? 'G' : (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U')}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isGuest ? 'Guest User' : (user?.user_metadata?.full_name || 'User')}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isGuest ? 'Demo Account' : user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
            {isGuest ? 'End Session' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile header - only visible on mobile */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">KeepMeOnTrack</span>
            </div>
            <div className="w-6"></div>
          </div>
        </header>

        {/* Main content area - NO top padding on desktop, aligned with sidebar */}
        <main className="flex-1 px-6 pb-6 pt-6 lg:pt-0">
          {children}
        </main>

        {/* Logo positioned below sidebar on desktop */}
        <div className="hidden lg:block fixed left-6 bottom-6 z-50">
          <img 
            src="/black_circle_360x360.png" 
            alt="Badge" 
            className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
          />
        </div>

        {/* Logo positioned in top-right on mobile */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
          <img 
            src="/black_circle_360x360.png" 
            alt="Badge" 
            className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}