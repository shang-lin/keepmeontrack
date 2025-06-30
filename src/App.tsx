import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { Settings } from './components/Settings';

function App() {
  const { user, loading, isDemoMode } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'settings'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show auth form if no user and not in demo mode
  if (!user && !isDemoMode) {
    return (
      <>
        <AuthForm
          mode={authMode}
          onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderActiveTab()}
      </Layout>
      <Toaster position="top-right" />
    </>
  );
}

export default App;