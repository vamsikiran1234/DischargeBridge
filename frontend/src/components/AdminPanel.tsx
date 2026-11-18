import React, { useState, useEffect } from 'react';
import { Department, User } from '../types';
import { api } from '../services/api';
import {
  Building2,
  CheckCircle2,
  Database,
  ExternalLink,
  Lock,
  Server,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [u, d] = await Promise.all([
        api.getAllUsers(),
        api.getDepartments(),
      ]);
      setUsers(u);
      setDepartments(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            Governance &amp; Staff Administration
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white">Hospital Operations Control</h2>
        <p className="text-xs text-slate-300 mt-1">
          Manage clinical and administrative personnel rosters, department privileges, and platform connectivity.
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Backend Architecture</span>
              <strong className="text-sm text-white">Spring Boot 3.3.5 Modular Monolith</strong>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Relational Database Engine</span>
              <strong className="text-sm text-white">PostgreSQL Dialect / Spring Data JPA</strong>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">API Documentation</span>
                <strong className="text-sm text-white">OpenAPI 3 / Swagger</strong>
              </div>
            </div>
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg"
              title="Open Swagger UI"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Personnel Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Hospital Staff Directory</h3>
          </div>
          <span className="text-xs text-slate-400">{users.length} active staff accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Name &amp; Email</th>
                <th className="py-2.5 px-3">Hospital Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white block">{u.fullName}</span>
                    <span className="text-slate-400 text-[11px] font-mono">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {u.department?.name || 'Central Administration'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Department Registry */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Hospital Department Registry</h3>
          </div>
          <span className="text-xs text-slate-400">{departments.length} registered departments</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {departments.map((dept) => (
            <div key={dept.id} className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-sky-400 font-bold">{dept.code}</span>
              <h5 className="font-semibold text-white text-xs">{dept.name}</h5>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Unit
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
