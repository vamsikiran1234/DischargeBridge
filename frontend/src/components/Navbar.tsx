import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  LogOut,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInitiateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenInitiateModal }) => {
  const { user, switchRole, logout } = useAuth();

  const roleConfigs: Record<
    Role,
    { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
  > = {
    DOCTOR: {
      label: 'Doctor (MD)',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
    },
    NURSE: {
      label: 'Nurse (RN)',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
    PHARMACIST: {
      label: 'Pharmacy (RPh)',
      icon: <Pill className="w-3.5 h-3.5" />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
    BILLING_STAFF: {
      label: 'Billing & TPA',
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
    COORDINATOR: {
      label: 'Coordinator',
      icon: <Layers className="w-3.5 h-3.5" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    ADMIN: {
      label: 'Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
    },
  };

  const currentRoleConfig = user ? roleConfigs[user.role] : roleConfigs.COORDINATOR;

  return (
    <header className="sticky top-0 z-40 bg-[#0c1427]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      {/* Top Demo Bar: 1-Click Role Impersonation */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-semibold tracking-wide uppercase text-[10px]">
            Live Coordination Pipeline
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">1-Click Role Switcher for Evaluation:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(Object.keys(roleConfigs) as Role[]).map((r) => {
            const cfg = roleConfigs[r];
            const isCurrent = user?.role === r;
            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 border ${
                  isCurrent
                    ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-1 ring-white/20 shadow-sm font-semibold`
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={`Impersonate ${cfg.label}`}
              >
                {cfg.icon}
                <span>{cfg.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('board')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-0.5 shadow-glow-primary flex items-center justify-center">
              <div className="w-full h-full bg-[#0c1427] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                  DischargeBridge
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                  Ops Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                One patient discharge. Multiple departments. One coordinated workflow.
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'board'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Readiness Board
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'workspace'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Department Tasks
            </button>

            <button
              onClick={() => setActiveTab('blockers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'blockers'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Blocker Radar
            </button>

            <button
              onClick={() => setActiveTab('admissions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'admissions'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Admissions
            </button>

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Action & User Profile */}
          <div className="flex items-center gap-3">
            {/* Initiate Discharge Button for Clinician/Coordinator */}
            <button
              onClick={onOpenInitiateModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Initiate Discharge</span>
            </button>

            {/* Profile Tag */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">{user?.fullName || 'Staff User'}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentRoleConfig.color.replace('text-', 'bg-')}`}></span>
                  <span>{user?.department?.name || user?.role}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
