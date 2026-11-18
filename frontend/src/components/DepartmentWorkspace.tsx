import React, { useState, useEffect } from 'react';
import { DepartmentTask, Role, TaskStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  Pill,
  Send,
  ShieldAlert,
  User,
} from 'lucide-react';

interface DepartmentWorkspaceProps {
  onSelectDischarge: (dischargeId: number) => void;
}

export const DepartmentWorkspace: React.FC<DepartmentWorkspaceProps> = ({ onSelectDischarge }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal actions
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [blockerReason, setBlockerReason] = useState<string>('');
  const [showBlockerModal, setShowBlockerModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getMyTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus, notes?: string) => {
    setActionLoading(true);
    try {
      await api.updateTaskStatus(taskId, newStatus, notes);
      setActiveTaskId(null);
      setActionNotes('');
      await loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRaiseBlocker = async () => {
    if (!activeTaskId || !blockerReason.trim()) return;
    setActionLoading(true);
    try {
      await api.raiseBlocker(activeTaskId, blockerReason);
      setShowBlockerModal(false);
      setActiveTaskId(null);
      setBlockerReason('');
      await loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to raise blocker');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return t.taskStatus === 'PENDING';
    if (filterStatus === 'IN_PROGRESS') return t.taskStatus === 'IN_PROGRESS';
    if (filterStatus === 'BLOCKED') return t.taskStatus === 'BLOCKED';
    if (filterStatus === 'COMPLETED') return t.taskStatus === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {user?.department?.name || 'Care Transition'} Operations
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Staff: {user?.fullName}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Department Action Center</h2>
          <p className="text-xs text-slate-300 mt-1">
            Review and execute operational discharge clearances assigned to your unit.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-850 p-1.5 rounded-xl border border-slate-800">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading department queue...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">Department Queue Clear</h4>
            <p className="text-xs text-slate-500 mt-1">No action items found for this filter condition.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isBlocked = task.taskStatus === 'BLOCKED';
            const isCompleted = task.taskStatus === 'COMPLETED';
            const isInProgress = task.taskStatus === 'IN_PROGRESS';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-xl border transition-all ${
                  isBlocked
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-800 opacity-80'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{task.taskName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                        {task.department.name}
                      </span>
                      {isBlocked ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" /> BLOCKED
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> COMPLETED
                        </span>
                      ) : isInProgress ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> IN PROGRESS
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          PENDING
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300">{task.description}</p>

                    {task.completionNotes && (
                      <div className="text-[11px] text-emerald-400 mt-1 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                        <strong>Completion Notes:</strong> {task.completionNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    <button
                      onClick={() => onSelectDischarge(task.dischargeCaseId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1"
                    >
                      <span>Inspect Case</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {!isCompleted && !isBlocked && (
                      <>
                        {task.taskStatus === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                          >
                            Start Task
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveTaskId(task.id);
                            const notes = prompt('Enter task completion notes (e.g. Meds labeled, TPA cleared, Vitals stable):');
                            if (notes !== null) {
                              handleUpdateStatus(task.id, 'COMPLETED', notes);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-success transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Complete</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTaskId(task.id);
                            setShowBlockerModal(true);
                          }}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Raise Blocker</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Raise Blocker Modal */}
      {showBlockerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Raise Department Blocker</h3>
                <p className="text-xs text-slate-400">Flag an operational impediment to the care coordinator</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Root Cause Reason:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Prescribed medication out of stock; Insurance pre-authorization denied pending doctor query; Attendant transport delayed..."
                value={blockerReason}
                onChange={(e) => setBlockerReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowBlockerModal(false);
                  setActiveTaskId(null);
                  setBlockerReason('');
                }}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseBlocker}
                disabled={actionLoading || !blockerReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-glow-danger"
              >
                Confirm &amp; Register Blocker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
