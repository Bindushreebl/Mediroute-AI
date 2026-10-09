/**
 * MediRoute AI - Smart Ambulance Route & Emergency Response System
 * "The fastest route when every second matters."
 *
 * Final-Year Engineering Decision Support System
 */

import React, { useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { DemoNotice } from './components/layout/DemoNotice';
import { Navbar } from './components/layout/Navbar';
import { CreateEmergencyModal } from './components/emergencies/CreateEmergencyModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { VoiceCadAssistant } from './components/voice/VoiceCadAssistant';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmergenciesPage } from './pages/EmergenciesPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { AmbulancesPage } from './pages/AmbulancesPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { RoutesPage } from './pages/RoutesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, theme } = useEmergency();
  const [currentTab, setCurrentTab] = useState<string>(isAuthenticated ? 'dashboard' : 'landing');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleOpenCreateEmergency = () => {
    if (!isAuthenticated) {
      setCurrentTab('landing');
    } else {
      setCreateModalOpen(true);
    }
  };

  const handleEmergencyCreated = (id: string) => {
    setCurrentTab('emergencies');
  };

  const isHighContrast = theme === 'high-contrast';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all duration-300 ease-in-out ${
        isHighContrast
          ? 'theme-high-contrast bg-black text-white selection:bg-rose-500 selection:text-white border-slate-900 contrast-125'
          : 'theme-minimalist bg-slate-50 text-slate-900 selection:bg-rose-200 selection:text-rose-950 shadow-none contrast-100'
      }`}
      data-theme={theme}
      data-environment={isHighContrast ? 'low-light-emergency' : 'daylight-minimalist'}
    >
      {/* Top Demo Notice Banner */}
      <DemoNotice />

      {/* Main Command Center Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenCreateEmergency={handleOpenCreateEmergency}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onStartEmergency={handleOpenCreateEmergency}
            onExploreDemo={() => setCurrentTab('live-map')}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'dashboard' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <DashboardPage
              onOpenCreateEmergency={handleOpenCreateEmergency}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          </ProtectedRoute>
        )}

        {currentTab === 'emergencies' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <EmergenciesPage onOpenCreateEmergency={handleOpenCreateEmergency} />
          </ProtectedRoute>
        )}

        {currentTab === 'live-map' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <LiveMapPage />
          </ProtectedRoute>
        )}

        {currentTab === 'ambulances' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <AmbulancesPage />
          </ProtectedRoute>
        )}

        {currentTab === 'hospitals' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <HospitalsPage />
          </ProtectedRoute>
        )}

        {currentTab === 'routes' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <RoutesPage />
          </ProtectedRoute>
        )}

        {currentTab === 'analytics' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <AnalyticsPage />
          </ProtectedRoute>
        )}

        {currentTab === 'reports' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <ReportsPage />
          </ProtectedRoute>
        )}

        {currentTab === 'settings' && (
          <ProtectedRoute onNavigateToAuth={() => setCurrentTab('landing')}>
            <SettingsPage />
          </ProtectedRoute>
        )}
      </main>

      {/* Global Create Emergency Modal */}
      <CreateEmergencyModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleEmergencyCreated}
      />

      {/* Global Hands-Free 108 Voice CAD Assistant */}
      <VoiceCadAssistant />
    </div>
  );
};

export default function App() {
  return (
    <EmergencyProvider>
      <AppContent />
    </EmergencyProvider>
  );
}
