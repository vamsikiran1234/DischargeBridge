import React, { useState } from 'react';
import { DashboardOverview, DischargeCase, DischargeReadiness, Role } from '../types';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  Lock,
  Pill,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

interface DischargeReadinessBoardProps {
  overview: DashboardOverview | null;
  isLoading: boolean;
  onSelectDischarge: (dischargeId: number) => void;
  onOpenInitiateModal: () => void;
  userRole?: Role;
}

export const DischargeReadinessBoard: React.FC<DischargeReadinessBoardProps> = ({
  overview,
  isLoading,
  onSelectDischarge,
  onOpenInitiateModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (isLoading || !overview) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Aggregating real-time departmental readiness data...</p>
      </div>
    );
  }

  // Filter cases
  const filteredCases = overview.activeDischarges.filter(({ dischargeCase, readiness }) => {
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'BLOCKED' && (readiness.blockedTasks > 0 || dischargeCase.dischargeStatus === 'BLOCKED')) ||
      (filterStatus === 'READY' && readiness.readyForFinalHandover) ||
      (filterStatus === 'IN_PROGRESS' && dischargeCase.dischargeStatus === 'IN_PROGRESS');

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      dischargeCase.admission.admissionReference.toLowerCase().includes(searchLower) ||
      dischargeCase.admission.patient.displayName.toLowerCase().includes(searchLower) ||
      dischargeCase.admission.bedReference.toLowerCase().includes(searchLower) ||
      dischargeCase.admission.department.name.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Platform Title & Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Cross-Departmental Orchestration
              </span>
              <span className="text-xs text-slate-400">• Dynamic Dependency Aware</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Discharge Readiness Board
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Eliminating hospital discharge bottlenecks by connecting Doctors, Nursing, Pharmacy, Billing &amp; Care Coordinators in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenInitiateModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-glow-primary transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Start New Discharge</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Discharges */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Discharges</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{overview.totalActiveDischarges}</span>
            <span className="text-xs text-slate-400">patients currently in transition</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Avg. Coordination: </span>
            <strong className="text-slate-200">{overview.averageCoordinationHours} hrs</strong>
          </div>
        </div>

        {/* Ready for Final Handover */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 shadow-sm hover:border-emerald-500/50 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Ready for Handover</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-300 tracking-tight">{overview.readyForHandoverCount}</span>
            <span className="text-xs text-slate-400">cleared by all 4 departments</span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-400/90 flex items-center gap-1.5 pt-2 border-t border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Coordinator final sign-off pending</span>
          </div>
        </div>

        {/* Pending Department Tasks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">In-Flight Tasks</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-300 tracking-tight">{overview.pendingTasksCount}</span>
            <span className="text-xs text-slate-400">operational tasks pending</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Parallel department processing</span>
          </div>
        </div>

        {/* Blocked Workflows */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 shadow-sm hover:border-rose-500/50 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">Blocked Workflows</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400 tracking-tight">{overview.blockedWorkflowsCount}</span>
            <span className="text-xs text-slate-400">requiring intervention</span>
          </div>
          <div className="mt-3 text-[11px] text-rose-300 flex items-center gap-1.5 pt-2 border-t border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Discharge Blocker Intelligence Active</span>
          </div>
        </div>
      </div>

      {/* Critical Blocker Alert Bar if active blockers exist */}
      {overview.criticalBlockers.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-slate-900 border border-rose-500/40 rounded-xl p-4 shadow-glow-danger">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Critical Blocker Intelligence Alert
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-semibold">
                  {overview.criticalBlockers.length} Active Roadblocks
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                The care transition coordinator has been flagged: the following bottleneck is preventing discharge completion:
              </p>
              <div className="mt-2.5 space-y-2">
                {overview.criticalBlockers.slice(0, 2).map((blocker) => (
                  <div
                    key={blocker.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-rose-900/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-rose-300">
                        {blocker.task.department.name}:
                      </span>
                      <span className="text-slate-200">"{blocker.reason}"</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Raised by: {blocker.raisedBy.fullName}</span>
                      <button
                        onClick={() => onSelectDischarge(blocker.task.dischargeCaseId)}
                        className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 underline underline-offset-2"
                      >
                        Inspect Patient <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient name, Admission ID, Bed, Dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Discharges' },
            { id: 'BLOCKED', label: 'Blocked' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'READY', label: 'Ready for Handover' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === st.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discharge Readiness Board Patient Cards */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-slate-300 font-semibold text-sm">No discharge workflows found</h3>
            <p className="text-slate-500 text-xs mt-1">Try adjusting your filters or initiate a new discharge workflow.</p>
          </div>
        ) : (
          filteredCases.map(({ dischargeCase, readiness }) => (
            <DischargePatientCard
              key={dischargeCase.id}
              dischargeCase={dischargeCase}
              readiness={readiness}
              onSelect={() => onSelectDischarge(dischargeCase.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* Individual Discharge Workflow Card */
const DischargePatientCard: React.FC<{
  dischargeCase: DischargeCase;
  readiness: DischargeReadiness;
  onSelect: () => void;
}> = ({ dischargeCase, readiness, onSelect }) => {
  const patient = dischargeCase.admission.patient;
  const isBlocked = readiness.blockedTasks > 0 || dischargeCase.dischargeStatus === 'BLOCKED';
  const isReady = readiness.readyForFinalHandover;
  const isCompleted = dischargeCase.dischargeStatus === 'COMPLETED';

  // Completion calculation
  const totalTasks = readiness.mandatoryTasks || 5;
  const completedTasks = readiness.completedTasks || 0;
  const percentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl border p-5 transition-all cursor-pointer ${
        isBlocked
          ? 'bg-gradient-to-r from-slate-900 via-rose-950/10 to-slate-900 border-rose-500/40 hover:border-rose-500 shadow-sm'
          : isReady
          ? 'bg-gradient-to-r from-slate-900 via-emerald-950/10 to-slate-900 border-emerald-500/40 hover:border-emerald-500 shadow-sm'
          : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50 shadow-sm'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Patient Identity & Bed Info */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm tracking-wide ${
              isBlocked
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : isReady
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}
          >
            {dischargeCase.admission.bedReference}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                {patient.displayName}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {dischargeCase.admission.admissionReference}
              </span>
              {/* Status Badge */}
              {isBlocked ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <AlertOctagon className="w-3 h-3" /> BLOCKED
                </span>
              ) : isReady ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> READY FOR FINAL HANDOVER
                </span>
              ) : isCompleted ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> COMPLETED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3 h-3" /> IN PROGRESS
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{dischargeCase.admission.department.name}</span>
              <span>•</span>
              <span>{patient.ageGender || 'Adult'}</span>
              <span>•</span>
              <span className="text-slate-300">{patient.primaryDiagnosis}</span>
              <span>•</span>
              <span className="text-sky-400/90 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Elapsed: {readiness.elapsedMinutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Workflow Progress Bar & Metrics */}
        <div className="flex items-center gap-6">
          <div className="w-48 text-right hidden md:block">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Readiness</span>
              <span className="text-white font-bold">{completedTasks} / {totalTasks} Tasks ({percentage}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
              <div
                className={`h-full transition-all duration-500 ${
                  isBlocked
                    ? 'bg-rose-500'
                    : isReady
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-sky-500 to-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 group-hover:border-sky-500/40 group-hover:text-white transition-all flex items-center gap-1"
            >
              <span>Manage</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Department Readiness Pipeline Visualizer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mr-1">
          Pipeline:
        </span>

        {/* 1. Clinician Clearance */}
        <div
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 border ${
            readiness.medicalClearanceGranted
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
          }`}
        >
          <Stethoscope className="w-3 h-3" />
          <span>Doctor Clearance: {readiness.medicalClearanceGranted ? 'Completed' : 'Pending'}</span>
        </div>

        {/* Department Breakdowns */}
        {readiness.departments.map((dept) => {
          const isDeptBlocked = dept.status === 'BLOCKED';
          const isDeptComplete = dept.status === 'COMPLETED';

          return (
            <div
              key={dept.departmentCode}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 border ${
                isDeptBlocked
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
                  : isDeptComplete
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <span>{dept.departmentName}:</span>
              <strong className="capitalize">{dept.status.toLowerCase()}</strong>
            </div>
          );
        })}
      </div>

      {/* Discharge Blocker Intelligence Callout if Blocked */}
      {isBlocked && (
        <div className="mt-3 p-2.5 bg-rose-950/30 border border-rose-500/30 rounded-lg flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Discharge Blocker:</strong> {readiness.departments.find(d => d.blocked)?.activeBlockReason || 'Medication/Authorization dependency active.'}
            </span>
          </div>
          <span className="text-[11px] underline underline-offset-2 font-medium cursor-pointer text-rose-200">
            Click to resolve blocker
          </span>
        </div>
      )}
    </div>
  );
};
