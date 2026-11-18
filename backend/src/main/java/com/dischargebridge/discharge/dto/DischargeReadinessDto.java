package com.dischargebridge.discharge.dto;

import com.dischargebridge.discharge.DischargeStatus;
import java.util.List;

public class DischargeReadinessDto {
    private Long dischargeId;
    private DischargeStatus status;
    private int mandatoryTasks;
    private int completedTasks;
    private int pendingTasks;
    private int blockedTasks;
    private boolean readyForFinalHandover;
    private boolean medicalClearanceGranted;
    private Long elapsedMinutes;
    private List<DepartmentStatusSummary> departments;

    public DischargeReadinessDto() {}

    public Long getDischargeId() {
        return dischargeId;
    }

    public void setDischargeId(Long dischargeId) {
        this.dischargeId = dischargeId;
    }

    public DischargeStatus getStatus() {
        return status;
    }

    public void setStatus(DischargeStatus status) {
        this.status = status;
    }

    public int getMandatoryTasks() {
        return mandatoryTasks;
    }

    public void setMandatoryTasks(int mandatoryTasks) {
        this.mandatoryTasks = mandatoryTasks;
    }

    public int getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(int completedTasks) {
        this.completedTasks = completedTasks;
    }

    public int getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(int pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public int getBlockedTasks() {
        return blockedTasks;
    }

    public void setBlockedTasks(int blockedTasks) {
        this.blockedTasks = blockedTasks;
    }

    public boolean isReadyForFinalHandover() {
        return readyForFinalHandover;
    }

    public void setReadyForFinalHandover(boolean readyForFinalHandover) {
        this.readyForFinalHandover = readyForFinalHandover;
    }

    public boolean isMedicalClearanceGranted() {
        return medicalClearanceGranted;
    }

    public void setMedicalClearanceGranted(boolean medicalClearanceGranted) {
        this.medicalClearanceGranted = medicalClearanceGranted;
    }

    public Long getElapsedMinutes() {
        return elapsedMinutes;
    }

    public void setElapsedMinutes(Long elapsedMinutes) {
        this.elapsedMinutes = elapsedMinutes;
    }

    public List<DepartmentStatusSummary> getDepartments() {
        return departments;
    }

    public void setDepartments(List<DepartmentStatusSummary> departments) {
        this.departments = departments;
    }

    public static class DepartmentStatusSummary {
        private String departmentCode;
        private String departmentName;
        private String status;
        private int totalTasks;
        private int completedTasks;
        private boolean blocked;
        private String activeBlockerReason;

        public DepartmentStatusSummary() {}

        public DepartmentStatusSummary(String departmentCode, String departmentName, String status, int totalTasks, int completedTasks, boolean blocked, String activeBlockerReason) {
            this.departmentCode = departmentCode;
            this.departmentName = departmentName;
            this.status = status;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.blocked = blocked;
            this.activeBlockerReason = activeBlockerReason;
        }

        public String getDepartmentCode() {
            return departmentCode;
        }

        public void setDepartmentCode(String departmentCode) {
            this.departmentCode = departmentCode;
        }

        public String getDepartmentName() {
            return departmentName;
        }

        public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public int getTotalTasks() {
            return totalTasks;
        }

        public void setTotalTasks(int totalTasks) {
            this.totalTasks = totalTasks;
        }

        public int getCompletedTasks() {
            return completedTasks;
        }

        public void setCompletedTasks(int completedTasks) {
            this.completedTasks = completedTasks;
        }

        public boolean isBlocked() {
            return blocked;
        }

        public void setBlocked(boolean blocked) {
            this.blocked = blocked;
        }

        public String getActiveBlockerReason() {
            return activeBlockerReason;
        }

        public void setActiveBlockerReason(String activeBlockerReason) {
            this.activeBlockerReason = activeBlockerReason;
        }
    }
}
