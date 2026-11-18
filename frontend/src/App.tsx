import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { DashboardOverview } from './types';
import { Navbar } from './components/Navbar';
import { DischargeReadinessBoard } from './components/DischargeReadinessBoard';
import { DepartmentWorkspace } from './components/DepartmentWorkspace';
import { BlockerRadar } from './components/BlockerRadar';
import { AdmissionsView } from './components/AdmissionsView';
import { AdminPanel } from './components/AdminPanel';
import { DischargeDetailModal } from './components/DischargeDetailModal';
import { InitiateDischargeModal } from './components/InitiateDischargeModal';

export const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('board');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [selectedDischargeId, setSelectedDischargeId] = useState<number | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState<boolean>(false);

  // Initial and periodic polling (every 20 seconds)
  useEffect(() => {
    loadOverview();

    const interval = setInterval(() => {
      loadOverview(false);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const loadOverview = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    try {
      const data = await api.getDashboardOverview();
      setOverview(data);
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-sans">
      {/* Dynamic Navbar with 1-Click Role Impersonation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInitiateModal={() => setShowInitiateModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'board' && (
          <DischargeReadinessBoard
            overview={overview}
            isLoading={loading}
            onSelectDischarge={(id) => setSelectedDischargeId(id)}
            onOpenInitiateModal={() => setShowInitiateModal(true)}
            userRole={user?.role}
          />
        )}

        {activeTab === 'workspace' && (
          <DepartmentWorkspace
            onSelectDischarge={(id) => setSelectedDischargeId(id)}
          />
        )}

        {activeTab === 'blockers' && (
          <BlockerRadar
            onSelectDischarge={(id) => setSelectedDischargeId(id)}
          />
        )}

        {activeTab === 'admissions' && (
          <AdmissionsView
            onOpenInitiateModal={() => setShowInitiateModal(true)}
          />
        )}

        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Modals */}
      {selectedDischargeId && (
        <DischargeDetailModal
          dischargeId={selectedDischargeId}
          onClose={() => setSelectedDischargeId(null)}
          onRefresh={() => loadOverview(false)}
        />
      )}

      {showInitiateModal && (
        <InitiateDischargeModal
          isOpen={showInitiateModal}
          onClose={() => setShowInitiateModal(false)}
          onSuccess={() => {
            loadOverview(false);
            setActiveTab('board');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#0c1427]/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>DischargeBridge</strong> — Hospital Operations Platform for Multidisciplinary Discharge Coordination
          </span>
          <span className="text-[11px] text-slate-400">
            Powered by Java 21, Spring Boot 3.3.5, PostgreSQL &amp; React
          </span>
        </div>
      </footer>
    </div>
  );
};
