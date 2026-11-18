package com.dischargebridge.discharge.dto;

import com.dischargebridge.audit.AuditLog;
import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.discharge.DischargeCase;
import com.dischargebridge.task.DepartmentTask;

import java.util.List;

public class DischargeCaseDetailDto {
    private DischargeCase dischargeCase;
    private DischargeReadinessDto readiness;
    private List<DepartmentTask> tasks;
    private List<TaskBlocker> blockers;
    private List<AuditLog> auditHistory;

    public DischargeCaseDetailDto() {}

    public DischargeCaseDetailDto(DischargeCase dischargeCase, DischargeReadinessDto readiness, List<DepartmentTask> tasks, List<TaskBlocker> blockers, List<AuditLog> auditHistory) {
        this.dischargeCase = dischargeCase;
        this.readiness = readiness;
        this.tasks = tasks;
        this.blockers = blockers;
        this.auditHistory = auditHistory;
    }

    public DischargeCase getDischargeCase() {
        return dischargeCase;
    }

    public void setDischargeCase(DischargeCase dischargeCase) {
        this.dischargeCase = dischargeCase;
    }

    public DischargeReadinessDto getReadiness() {
        return readiness;
    }

    public void setReadiness(DischargeReadinessDto readiness) {
        this.readiness = readiness;
    }

    public List<DepartmentTask> getTasks() {
        return tasks;
    }

    public void setTasks(List<DepartmentTask> tasks) {
        this.tasks = tasks;
    }

    public List<TaskBlocker> getBlockers() {
        return blockers;
    }

    public void setBlockers(List<TaskBlocker> blockers) {
        this.blockers = blockers;
    }

    public List<AuditLog> getAuditHistory() {
        return auditHistory;
    }

    public void setAuditHistory(List<AuditLog> auditHistory) {
        this.auditHistory = auditHistory;
    }
}
