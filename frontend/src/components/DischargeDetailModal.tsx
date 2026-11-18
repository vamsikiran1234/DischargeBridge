import React, { useState, useEffect } from 'react';
import { DischargeCaseDetail, Role, TaskStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  History,
  Lock,
  Pill,
  Send,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from 'lucide-react';

interface DischargeDetailModalProps {
  dischargeId: number | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const DischargeDetailModal: React.FC<DischargeDetailModalProps> = ({
  dischargeId,
  onClose,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [detail, setDetail] = useState<DischargeCaseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clinician clearance form state
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [showClearanceForm, setShowClearanceForm] = useState<boolean>(false);

  // Raise blocker form state
  const [blockingTaskId, setBlockingTaskId] = useState<number | null>(null);
  const [blockerReason, setBlockerReason] = useState<string>('');

  // Resolve blocker form state
  const [resolvingBlockerId, setResolvingBlockerId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  // Complete task form state
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [taskNotes, setTaskNotes] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'tasks' | 'blockers' | 'history'>('tasks');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (dischargeId) {
      loadDetails();
    }
  }, [dischargeId]);

  const loadDetails = async () => {
    if (!dischargeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDischargeDetails(dischargeId);
      setDetail(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load discharge details');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordMedicalClearance = async () => {
    if (!dischargeId || !doctorNotes.trim()) return;
    setActionLoading(true);
    try {
      await api.recordMedicalClearance(dischargeId, doctorNotes);
      setShowClearanceForm(false);
      setDoctorNotes('');
      await loadDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to record medical clearance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: TaskStatus, notes?: string) => {
    setActionLoading(true);
    try {
      await api.updateTaskStatus(taskId, status, notes);
      setCompletingTaskId(null);
      setTaskNotes('');
      await loadDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseBlocker = async () => {
    if (!blockingTaskId || !blockerReason.trim()) return;
    setActionLoading(true);
    try {
      await api.raiseBlocker(blockingTaskId, blockerReason);
      setBlockingTaskId(null);
      setBlockerReason('');
      await loadDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to raise blocker');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveBlocker = async () => {
    if (!resolvingBlockerId) return;
    setActionLoading(true);
    try {
      await api.resolveBlocker(resolvingBlockerId, resolutionNotes);
      setResolvingBlockerId(null);
      setResolutionNotes('');
      await loadDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve blocker');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteFinalHandover = async () => {
    if (!dischargeId) return;
    if (!confirm('Confirm final physical discharge and handover of patient? This will discharge the admission and free the hospital bed.')) {
      return;
    }
    setActionLoading(true);
    try {
      await api.completeFinalHandover(dischargeId);
      await loadDetails();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to complete discharge handover');
    } finally {
      setActionLoading(false);
    }
  };

  if (!dischargeId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {detail?.dischargeCase.admission.patient.displayName || 'Discharge Details'}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {detail?.dischargeCase.admission.admissionReference}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20">
                  {detail?.dischargeCase.admission.bedReference}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {detail?.dischargeCase.admission.department.name} • {detail?.dischargeCase.admission.patient.primaryDiagnosis}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Loading patient workflow status...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {detail && (
            <>
              {/* Readiness Progress Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  detail.readiness.blockedTasks > 0
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : detail.readiness.readyForFinalHandover
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-sky-950/20 border-sky-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Discharge Readiness Status:
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        detail.readiness.blockedTasks > 0
                          ? 'bg-rose-500/20 text-rose-300'
                          : detail.readiness.readyForFinalHandover
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {detail.dischargeCase.dischargeStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {detail.readiness.completedTasks} of {detail.readiness.mandatoryTasks} mandatory department tasks completed.
                    {detail.readiness.blockedTasks > 0 && ` (${detail.readiness.blockedTasks} active blocker preventing progression)`}
                  </p>
                </div>

                {/* Final Handover Trigger (Only for Coordinator/Admin when ready) */}
                {detail.dischargeCase.dischargeStatus !== 'COMPLETED' && (
                  <div>
                    {detail.readiness.readyForFinalHandover ? (
                      <button
                        onClick={handleCompleteFinalHandover}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-success transition-all flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize Final Discharge Handover</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Handover locked until all tasks cleared</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Medical Clearance Section */}
              <div className="bg-slate-850 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Clinical Medical Clearance
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Clinical authorization required by attending physician before operational completion
                      </p>
                    </div>
                  </div>

                  <div>
                    {detail.dischargeCase.medicalClearanceAt ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved by {detail.dischargeCase.clearedByDoctor?.fullName || 'Physician'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" /> Clearance Pending
                      </span>
                    )}
                  </div>
                </div>

                {detail.dischargeCase.clinicalDischargeNotes && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-400 block text-[10px] uppercase mb-1">Clinician Discharge Instructions:</strong>
                    {detail.dischargeCase.clinicalDischargeNotes}
                  </div>
                )}

                {/* If clearance pending and user is Doctor or Admin, show record clearance option */}
                {!detail.dischargeCase.medicalClearanceAt && (user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    {!showClearanceForm ? (
                      <button
                        onClick={() => setShowClearanceForm(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Record Clinician Clearance</span>
                      </button>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <textarea
                          rows={2}
                          placeholder="Enter clinician discharge instructions, medication dosage, and follow-up advisory..."
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRecordMedicalClearance}
                            disabled={actionLoading || !doctorNotes.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                          >
                            Sign &amp; Grant Clearance
                          </button>
                          <button
                            onClick={() => setShowClearanceForm(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs for Navigation */}
              <div className="flex border-b border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'tasks'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Department Checklist ({detail.tasks.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('blockers')}
                  className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'blockers'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Blockers &amp; Impediments ({detail.blockers.filter(b => b.blockerStatus === 'ACTIVE').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'history'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Immutable Audit Log ({detail.auditHistory.length})</span>
                </button>
              </div>

              {/* Tab 1: Department Tasks Checklist */}
              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  {detail.tasks.map((task) => {
                    const isCompleted = task.taskStatus === 'COMPLETED';
                    const isTaskBlocked = task.taskStatus === 'BLOCKED';
                    const isInProgress = task.taskStatus === 'IN_PROGRESS';

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isTaskBlocked
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : isCompleted
                            ? 'bg-slate-850/80 border-slate-800'
                            : 'bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : isTaskBlocked ? (
                                <AlertOctagon className="w-4 h-4 text-rose-400" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{task.taskName}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                                  {task.department.name}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                              {task.completionNotes && (
                                <div className="mt-1 text-[11px] text-emerald-400/90 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                                  <strong>Notes:</strong> {task.completionNotes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {!isCompleted && !isTaskBlocked && (
                              <>
                                {completingTaskId === task.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Completion notes..."
                                      value={taskNotes}
                                      onChange={(e) => setTaskNotes(e.target.value)}
                                      className="bg-slate-900 border border-slate-700 text-xs px-2.5 py-1 rounded text-white focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED', taskNotes)}
                                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setCompletingTaskId(null)}
                                      className="text-xs text-slate-400 hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setCompletingTaskId(task.id)}
                                    className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                                  >
                                    Mark Done
                                  </button>
                                )}

                                <button
                                  onClick={() => setBlockingTaskId(task.id)}
                                  className="px-2.5 py-1 rounded text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                                >
                                  Raise Blocker
                                </button>
                              </>
                            )}

                            {isCompleted && (
                              <span className="text-[11px] text-slate-400">
                                Completed by {task.completedBy?.fullName || 'Staff'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Inline Raise Blocker Form */}
                        {blockingTaskId === task.id && (
                          <div className="mt-3 pt-3 border-t border-rose-900/60 bg-rose-950/30 p-3 rounded-lg space-y-2">
                            <span className="text-xs font-bold text-rose-300">Raise Operational Blocker:</span>
                            <input
                              type="text"
                              placeholder="Reason (e.g. Medicine unavailable, Insurance pre-auth pending, Attendant delay)..."
                              value={blockerReason}
                              onChange={(e) => setBlockerReason(e.target.value)}
                              className="w-full bg-slate-900 border border-rose-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleRaiseBlocker}
                                disabled={actionLoading || !blockerReason.trim()}
                                className="px-3 py-1 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                              >
                                Submit Blocker
                              </button>
                              <button
                                onClick={() => setBlockingTaskId(null)}
                                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Blockers & Intelligence */}
              {activeTab === 'blockers' && (
                <div className="space-y-4">
                  {detail.blockers.length === 0 ? (
                    <div className="text-center py-10 bg-slate-850 rounded-xl border border-slate-800">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-300 font-semibold">Zero Active Blockers</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Workflow proceeding with no recorded operational impediments.</p>
                    </div>
                  ) : (
                    detail.blockers.map((b) => (
                      <div
                        key={b.id}
                        className={`p-4 rounded-xl border ${
                          b.blockerStatus === 'ACTIVE'
                            ? 'bg-rose-950/30 border-rose-500/40'
                            : 'bg-slate-850 border-slate-800 opacity-70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                b.blockerStatus === 'ACTIVE'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {b.blockerStatus}
                            </span>
                            <span className="text-xs font-bold text-white">{b.task.taskName}</span>
                            <span className="text-xs text-slate-400">({b.task.department.name})</span>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            Raised by {b.raisedBy.fullName}
                          </span>
                        </div>

                        <p className="text-xs text-rose-200 mt-2 font-medium">"{b.reason}"</p>

                        {b.blockerStatus === 'RESOLVED' && b.resolutionNotes && (
                          <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                            <strong>Resolved by {b.resolvedBy?.fullName}:</strong> {b.resolutionNotes}
                          </div>
                        )}

                        {b.blockerStatus === 'ACTIVE' && (
                          <div className="mt-3 pt-3 border-t border-rose-900/60">
                            {resolvingBlockerId === b.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="Resolution notes (e.g. Stock replenished from dispensary, TPA approval received)..."
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleResolveBlocker}
                                    className="px-3 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                                  >
                                    Mark Resolved &amp; Resume Task
                                  </button>
                                  <button
                                    onClick={() => setResolvingBlockerId(null)}
                                    className="text-xs text-slate-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setResolvingBlockerId(b.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                              >
                                Resolve Roadblock
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Complete Audit History Timeline */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-400 mb-2">
                    Hospital operations traceability log (every initiation, completion, and blocker resolution recorded with immutable actor timestamps):
                  </div>
                  <div className="relative pl-4 border-l-2 border-slate-800 space-y-4">
                    {detail.auditHistory.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-slate-900"></div>
                        <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-400">{item.action}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-slate-300 mt-1">
                            <span className="text-slate-400 font-medium">Actor: </span>
                            <strong className="text-white">{item.actor?.fullName || 'System'}</strong> ({item.actor?.role || 'Staff'})
                          </div>
                          {(item.oldValue || item.newValue) && (
                            <div className="mt-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                              {item.oldValue ? `${item.oldValue} → ` : ''}
                              <span className="text-emerald-400">{item.newValue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
