import React, { useState, useEffect } from 'react';
import { Admission, Department } from '../types';
import { api } from '../services/api';
import {
  Bed,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Stethoscope,
  Users,
} from 'lucide-react';

interface AdmissionsViewProps {
  onOpenInitiateModal: () => void;
}

export const AdmissionsView: React.FC<AdmissionsViewProps> = ({ onOpenInitiateModal }) => {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New admission form
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>('');
  const [ageGender, setAgeGender] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<number>(1);
  const [bedReference, setBedReference] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adms, depts] = await Promise.all([
        api.getAllAdmissions(),
        api.getDepartments(),
      ]);
      setAdmissions(adms);
      setDepartments(depts);
      if (depts.length > 0) {
        setDepartmentId(depts[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !bedReference.trim()) return;
    setCreating(true);
    try {
      await api.createAdmission(patientName, ageGender, diagnosis, departmentId, bedReference);
      setShowAddModal(false);
      setPatientName('');
      setAgeGender('');
      setDiagnosis('');
      setBedReference('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create admission');
    } finally {
      setCreating(false);
    }
  };

  const filtered = admissions.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.admissionReference.toLowerCase().includes(q) ||
      a.patient.displayName.toLowerCase().includes(q) ||
      a.bedReference.toLowerCase().includes(q) ||
      a.department.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inpatient Census &amp; Admissions</h2>
          <p className="text-xs text-slate-300 mt-1">
            Tracking hospital inpatients, bed assignments, and active admission references.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Admit Demo Patient</span>
          </button>
          <button
            onClick={onOpenInitiateModal}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Start Discharge</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter admitted patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((adm) => {
          const isAdmitted = adm.admissionStatus === 'ADMITTED';

          return (
            <div
              key={adm.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 font-semibold">
                  {adm.admissionReference}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmitted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {adm.admissionStatus}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{adm.patient.displayName}</h4>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{adm.patient.ageGender || 'Adult'}</span>
                  <span>•</span>
                  <span className="text-sky-300 font-semibold flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5" /> {adm.bedReference}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500">Unit: </span>
                  <strong className="text-slate-300">{adm.department.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Diagnosis: </span>
                  <span className="text-slate-400">{adm.patient.primaryDiagnosis || 'Clinical management'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Demo Admission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Synthetic Inpatient Admission</h3>

            <form onSubmit={handleCreateAdmission} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Green"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Age &amp; Gender:</label>
                  <input
                    type="text"
                    placeholder="e.g. 52M"
                    value={ageGender}
                    onChange={(e) => setAgeGender(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Bed Reference:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bed G-18"
                    value={bedReference}
                    onChange={(e) => setBedReference(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Primary Diagnosis:</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Gastroenteritis, Dehydration"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Admitting Department:</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-lg font-semibold bg-sky-600 hover:bg-sky-500 text-white"
                >
                  {creating ? 'Admitting...' : 'Admit Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
