import {
  Admission,
  AuditLog,
  DashboardOverview,
  Department,
  DepartmentTask,
  DischargeCase,
  DischargeCaseDetail,
  DischargeReadiness,
  TaskBlocker,
  TaskStatus,
  User,
} from '../types';

const API_BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('dischargebridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{
      token: string;
      userId: number;
      fullName: string;
      email: string;
      role: string;
      departmentId?: number;
      departmentName?: string;
    }>(res);
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DashboardOverview>(res);
  },

  async getActiveBlockers(): Promise<TaskBlocker[]> {
    const res = await fetch(`${API_BASE_URL}/dashboard/blocked`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<TaskBlocker[]>(res);
  },

  async getPendingTasks(): Promise<DepartmentTask[]> {
    const res = await fetch(`${API_BASE_URL}/dashboard/pending-tasks`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DepartmentTask[]>(res);
  },

  // Discharges
  async getAllDischarges(): Promise<DischargeCase[]> {
    const res = await fetch(`${API_BASE_URL}/discharges`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DischargeCase[]>(res);
  },

  async getActiveDischarges(): Promise<DischargeCase[]> {
    const res = await fetch(`${API_BASE_URL}/discharges/active`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DischargeCase[]>(res);
  },

  async getDischargeDetails(id: number): Promise<DischargeCaseDetail> {
    const res = await fetch(`${API_BASE_URL}/discharges/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DischargeCaseDetail>(res);
  },

  async getDischargeReadiness(id: number): Promise<DischargeReadiness> {
    const res = await fetch(`${API_BASE_URL}/discharges/${id}/readiness`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DischargeReadiness>(res);
  },

  async getDischargeHistory(id: number): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE_URL}/discharges/${id}/history`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<AuditLog[]>(res);
  },

  async initiateDischarge(admissionId: number, clinicalNotes?: string, recordMedicalClearanceImmediately: boolean = false): Promise<DischargeCase> {
    const res = await fetch(`${API_BASE_URL}/discharges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        admissionId,
        clinicalDischargeNotes: clinicalNotes,
        recordMedicalClearanceImmediately,
      }),
    });
    return handleResponse<DischargeCase>(res);
  },

  async recordMedicalClearance(dischargeId: number, clinicalNotes: string): Promise<DischargeCase> {
    const res = await fetch(`${API_BASE_URL}/discharges/${dischargeId}/medical-clearance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ clinicalNotes }),
    });
    return handleResponse<DischargeCase>(res);
  },

  async completeFinalHandover(dischargeId: number): Promise<DischargeCase> {
    const res = await fetch(`${API_BASE_URL}/discharges/${dischargeId}/complete`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DischargeCase>(res);
  },

  // Department Tasks & Blockers
  async getMyTasks(): Promise<DepartmentTask[]> {
    const res = await fetch(`${API_BASE_URL}/tasks/my-tasks`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DepartmentTask[]>(res);
  },

  async updateTaskStatus(taskId: number, status: TaskStatus, notes?: string): Promise<DepartmentTask> {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse<DepartmentTask>(res);
  },

  async assignTask(taskId: number, assignToUserId: number): Promise<DepartmentTask> {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/assign?assignToUserId=${assignToUserId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DepartmentTask>(res);
  },

  async raiseBlocker(taskId: number, reason: string): Promise<TaskBlocker> {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/blockers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse<TaskBlocker>(res);
  },

  async resolveBlocker(blockerId: number, resolutionNotes?: string): Promise<TaskBlocker> {
    const res = await fetch(`${API_BASE_URL}/blockers/${blockerId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ resolutionNotes }),
    });
    return handleResponse<TaskBlocker>(res);
  },

  // Admissions & Departments
  async getAllAdmissions(): Promise<Admission[]> {
    const res = await fetch(`${API_BASE_URL}/admissions`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Admission[]>(res);
  },

  async getActiveAdmissions(): Promise<Admission[]> {
    const res = await fetch(`${API_BASE_URL}/admissions/active`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Admission[]>(res);
  },

  async searchAdmissions(query: string): Promise<Admission[]> {
    const res = await fetch(`${API_BASE_URL}/admissions/search?query=${encodeURIComponent(query)}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Admission[]>(res);
  },

  async createAdmission(patientDisplayName: string, ageGender: string, primaryDiagnosis: string, departmentId: number, bedReference: string): Promise<Admission> {
    const res = await fetch(`${API_BASE_URL}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        patientDisplayName,
        ageGender,
        primaryDiagnosis,
        departmentId,
        bedReference,
      }),
    });
    return handleResponse<Admission>(res);
  },

  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE_URL}/departments`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Department[]>(res);
  },

  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<User[]>(res);
  },
};
