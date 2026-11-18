export type Role = 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'BILLING_STAFF' | 'COORDINATOR' | 'ADMIN';

export type DischargeStatus = 'INITIATED' | 'IN_PROGRESS' | 'BLOCKED' | 'READY_FOR_FINAL_HANDOVER' | 'COMPLETED' | 'CANCELLED';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';

export type BlockerStatus = 'ACTIVE' | 'RESOLVED';

export interface Department {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  department?: Department;
  active: boolean;
}

export interface Patient {
  id: number;
  patientReference: string;
  displayName: string;
  ageGender?: string;
  primaryDiagnosis?: string;
  createdAt: string;
}

export interface Admission {
  id: number;
  admissionReference: string;
  patient: Patient;
  department: Department;
  bedReference: string;
  admittedAt: string;
  admissionStatus: string;
}

export interface DischargeCase {
  id: number;
  admission: Admission;
  initiatedBy: User;
  dischargeStatus: DischargeStatus;
  medicalClearanceAt?: string | null;
  clearedByDoctor?: User | null;
  clinicalDischargeNotes?: string | null;
  startedAt: string;
  completedAt?: string | null;
  completedBy?: User | null;
  version: number;
}

export interface DepartmentTask {
  id: number;
  dischargeCaseId: number;
  department: Department;
  assignedTo?: User | null;
  taskName: string;
  description: string;
  taskStatus: TaskStatus;
  mandatory: boolean;
  dueAt?: string | null;
  completedAt?: string | null;
  completedBy?: User | null;
  completionNotes?: string | null;
  createdAt: string;
}

export interface TaskBlocker {
  id: number;
  task: DepartmentTask;
  raisedBy: User;
  reason: string;
  blockerStatus: BlockerStatus;
  resolvedBy?: User | null;
  resolutionNotes?: string | null;
  raisedAt: string;
  resolvedAt?: string | null;
}

export interface AuditLog {
  id: number;
  dischargeCaseId: number;
  actor: User;
  action: string;
  entityType: string;
  entityId: number;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface DepartmentStatusSummary {
  departmentCode: string;
  departmentName: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  blocked: boolean;
  activeBlockReason?: string | null;
}

export interface DischargeReadiness {
  dischargeId: number;
  status: DischargeStatus;
  mandatoryTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  readyForFinalHandover: boolean;
  medicalClearanceGranted: boolean;
  elapsedMinutes: number;
  departments: DepartmentStatusSummary[];
}

export interface DischargeCaseDetail {
  dischargeCase: DischargeCase;
  readiness: DischargeReadiness;
  tasks: DepartmentTask[];
  blockers: TaskBlocker[];
  auditHistory: AuditLog[];
}

export interface DashboardOverview {
  totalActiveDischarges: number;
  readyForHandoverCount: number;
  pendingTasksCount: number;
  blockedWorkflowsCount: number;
  completedTodayCount: number;
  averageCoordinationHours: number;
  pendingTasksByDepartment: Record<string, number>;
  activeDischarges: Array<{
    dischargeCase: DischargeCase;
    readiness: DischargeReadiness;
  }>;
  criticalBlockers: TaskBlocker[];
}
