import React, { useState, useEffect } from 'react';
import { Admission } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Search,
  Stethoscope,
  User,
  X,
} from 'lucide-react';

interface InitiateDischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InitiateDischargeModal: React.FC<InitiateDischargeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [immediateClearance, setImmediateClearance] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAdmissions();
    }
  }, [isOpen]);

  const loadAdmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const active = await api.getActiveAdmissions();
      setAdmissions(active);
      if (active.length > 0) {
        setSelectedAdmissionId(active[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admitted patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId) {
      setError('Please select an admitted patient');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.initiateDischarge(selectedAdmissionId, clinicalNotes, immediateClearance);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate discharge');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredAdmissions = admissions.filter((adm) => {
    const q = searchQuery.toLowerCase();
    return (
      adm.admissionReference.toLowerCase().includes(q) ||
      adm.patient.displayName.toLowerCase().includes(q) ||
      adm.bedReference.toLowerCase().includes(q) ||
      adm.department.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Initiate Patient Discharge Workflow</h3>
              <p className="text-xs text-slate-400">
                Spawns coordinated department tasks for Nursing, Pharmacy &amp; Billing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admitted Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Admitted Patient
            </label>

            {/* Quick Filter */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter admitted patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-800 rounded-xl p-2 bg-slate-950/40">
              {filteredAdmissions.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  {loading ? 'Loading admissions...' : 'No active admitted patients available'}
                </div>
              ) : (
                filteredAdmissions.map((adm) => (
                  <div
                    key={adm.id}
                    onClick={() => setSelectedAdmissionId(adm.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedAdmissionId === adm.id
                        ? 'bg-sky-500/15 border-sky-500/40 text-white'
                        : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        <span>{adm.patient.displayName}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {adm.admissionReference}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {adm.department.name} • {adm.patient.primaryDiagnosis || 'Under Observation'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-sky-400">{adm.bedReference}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Clinical Discharge Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Clinician Discharge Notes &amp; Plan of Care
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Afebrile for 48 hrs. Vitals normalized. Prescribe 5-day course oral antibiotic. Approved for discharge."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Immediate Clearance Toggle */}
          <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Record Clinical Clearance Immediately
              </span>
              <span className="text-[11px] text-slate-400">
                Authorized clinician signs medical clearance at time of initiation
              </span>
            </div>
            <input
              type="checkbox"
              checked={immediateClearance}
              onChange={(e) => setImmediateClearance(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedAdmissionId}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-glow-primary transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Initiating Workflow...' : 'Initiate Discharge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
