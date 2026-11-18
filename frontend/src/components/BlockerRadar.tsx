import React, { useState, useEffect } from 'react';
import { TaskBlocker } from '../types';
import { api } from '../services/api';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';

interface BlockerRadarProps {
  onSelectDischarge: (dischargeId: number) => void;
}

export const BlockerRadar: React.FC<BlockerRadarProps> = ({ onSelectDischarge }) => {
  const [blockers, setBlockers] = useState<TaskBlocker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  useEffect(() => {
    loadBlockers();
  }, []);

  const loadBlockers = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveBlockers();
      setBlockers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (blockerId: number) => {
    try {
      await api.resolveBlocker(blockerId, resolutionNotes);
      setResolvingId(null);
      setResolutionNotes('');
      await loadBlockers();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve blocker');
    }
  };

  return (
    <div className="space-y-6">
      {/* Intelligence Header */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3 text-rose-400" />
            Discharge Blocker Intelligence Hub
          </span>
          <span className="text-xs text-slate-400">• Bottleneck Mitigation</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Hospital Roadblock Radar</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Instantly identifying what is preventing patient discharge, which department owns the bottleneck, and actionable pathways to resolve delays.
        </p>
      </div>

      {/* Blocker Intelligence Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Scanning for hospital workflow impediments...</p>
          </div>
        ) : blockers.length === 0 ? (
          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">All Clear — Zero Active Blockers</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No hospital departments have registered roadblocks. All patient discharge pathways are executing smoothly.
            </p>
          </div>
        ) : (
          blockers.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900 border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-5 shadow-glow-danger transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" /> ACTIVE ROADBLOCK
                    </span>
                    <span className="font-bold text-white text-base">
                      {b.task.department.name} Unit
                    </span>
                    <span className="text-xs text-slate-400">
                      Task: <strong className="text-slate-200">{b.task.taskName}</strong>
                    </span>
                  </div>

                  {/* Impediment Reason */}
                  <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded-lg text-xs text-rose-200">
                    <strong className="text-rose-300 block text-[10px] uppercase tracking-wider mb-0.5">
                      Obstacle Description:
                    </strong>
                    "{b.reason}"
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Raised by: {b.raisedBy.fullName} ({b.raisedBy.role})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-400" /> Raised at: {new Date(b.raisedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Blocker Action */}
                <div className="flex flex-col sm:flex-row items-center gap-2 self-start lg:self-center">
                  <button
                    onClick={() => onSelectDischarge(b.task.dischargeCaseId)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>View Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {resolvingId === b.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Resolution notes..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-white"
                      />
                      <button
                        onClick={() => handleResolve(b.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setResolvingId(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResolvingId(b.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-success transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolve Bottleneck</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
