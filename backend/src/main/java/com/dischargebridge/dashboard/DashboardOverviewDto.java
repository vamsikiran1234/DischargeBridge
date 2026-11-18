package com.dischargebridge.dashboard;

import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.discharge.DischargeCase;
import com.dischargebridge.discharge.dto.DischargeReadinessDto;

import java.util.List;
import java.util.Map;

public class DashboardOverviewDto {
    private long totalActiveDischarges;
    private long readyForHandoverCount;
    private long pendingTasksCount;
    private long blockedWorkflowsCount;
    private long completedTodayCount;
    private double averageCoordinationHours;
    private Map<String, Long> pendingTasksByDepartment;
    private List<DischargeCaseSummary> activeDischarges;
    private List<TaskBlocker> criticalBlockers;

    public DashboardOverviewDto() {}

    public long getTotalActiveDischarges() {
        return totalActiveDischarges;
    }

    public void setTotalActiveDischarges(long totalActiveDischarges) {
        this.totalActiveDischarges = totalActiveDischarges;
    }

    public long getReadyForHandoverCount() {
        return readyForHandoverCount;
    }

    public void setReadyForHandoverCount(long readyForHandoverCount) {
        this.readyForHandoverCount = readyForHandoverCount;
    }

    public long getPendingTasksCount() {
        return pendingTasksCount;
    }

    public void setPendingTasksCount(long pendingTasksCount) {
        this.pendingTasksCount = pendingTasksCount;
    }

    public long getBlockedWorkflowsCount() {
        return blockedWorkflowsCount;
    }

    public void setBlockedWorkflowsCount(long blockedWorkflowsCount) {
        this.blockedWorkflowsCount = blockedWorkflowsCount;
    }

    public long getCompletedTodayCount() {
        return completedTodayCount;
    }

    public void setCompletedTodayCount(long completedTodayCount) {
        this.completedTodayCount = completedTodayCount;
    }

    public double getAverageCoordinationHours() {
        return averageCoordinationHours;
    }

    public void setAverageCoordinationHours(double averageCoordinationHours) {
        this.averageCoordinationHours = averageCoordinationHours;
    }

    public Map<String, Long> getPendingTasksByDepartment() {
        return pendingTasksByDepartment;
    }

    public void setPendingTasksByDepartment(Map<String, Long> pendingTasksByDepartment) {
        this.pendingTasksByDepartment = pendingTasksByDepartment;
    }

    public List<DischargeCaseSummary> getActiveDischarges() {
        return activeDischarges;
    }

    public void setActiveDischarges(List<DischargeCaseSummary> activeDischarges) {
        this.activeDischarges = activeDischarges;
    }

    public List<TaskBlocker> getCriticalBlockers() {
        return criticalBlockers;
    }

    public void setCriticalBlockers(List<TaskBlocker> criticalBlockers) {
        this.criticalBlockers = criticalBlockers;
    }

    public static class DischargeCaseSummary {
        private DischargeCase dischargeCase;
        private DischargeReadinessDto readiness;

        public DischargeCaseSummary() {}

        public DischargeCaseSummary(DischargeCase dischargeCase, DischargeReadinessDto readiness) {
            this.dischargeCase = dischargeCase;
            this.readiness = readiness;
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
    }
}
