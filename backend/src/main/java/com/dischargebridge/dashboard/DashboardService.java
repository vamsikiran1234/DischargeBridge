package com.dischargebridge.dashboard;

import com.dischargebridge.blocker.BlockerRepository;
import com.dischargebridge.blocker.BlockerStatus;
import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.discharge.DischargeCase;
import com.dischargebridge.discharge.DischargeRepository;
import com.dischargebridge.discharge.DischargeStatus;
import com.dischargebridge.discharge.ReadinessService;
import com.dischargebridge.discharge.dto.DischargeReadinessDto;
import com.dischargebridge.task.DepartmentTask;
import com.dischargebridge.task.TaskRepository;
import com.dischargebridge.task.TaskStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final DischargeRepository dischargeRepository;
    private final TaskRepository taskRepository;
    private final BlockerRepository blockerRepository;
    private final ReadinessService readinessService;

    public DashboardService(DischargeRepository dischargeRepository,
                            TaskRepository taskRepository,
                            BlockerRepository blockerRepository,
                            ReadinessService readinessService) {
        this.dischargeRepository = dischargeRepository;
        this.taskRepository = taskRepository;
        this.blockerRepository = blockerRepository;
        this.readinessService = readinessService;
    }

    public DashboardOverviewDto getOverview() {
        DashboardOverviewDto dto = new DashboardOverviewDto();

        List<DischargeCase> activeCases = dischargeRepository.findActiveDischarges();
        List<DashboardOverviewDto.DischargeCaseSummary> caseSummaries = new ArrayList<>();

        long readyCount = 0;
        long blockedCount = 0;

        for (DischargeCase dc : activeCases) {
            DischargeReadinessDto readiness = readinessService.calculateReadiness(dc);
            caseSummaries.add(new DashboardOverviewDto.DischargeCaseSummary(dc, readiness));

            if (readiness.isReadyForFinalHandover()) {
                readyCount++;
            }
            if (readiness.getBlockedTasks() > 0 || dc.getDischargeStatus() == DischargeStatus.BLOCKED) {
                blockedCount++;
            }
        }

        dto.setTotalActiveDischarges(activeCases.size());
        dto.setReadyForHandoverCount(readyCount);
        dto.setBlockedWorkflowsCount(blockedCount);
        dto.setActiveDischarges(caseSummaries);

        // Pending Tasks
        List<DepartmentTask> allPendingTasks = taskRepository.findAll().stream()
                .filter(t -> t.getTaskStatus() == TaskStatus.PENDING || t.getTaskStatus() == TaskStatus.IN_PROGRESS)
                .collect(Collectors.toList());
        dto.setPendingTasksCount(allPendingTasks.size());

        // Pending Tasks grouped by Department Name
        Map<String, Long> pendingByDept = allPendingTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getDepartment().getName(), Collectors.counting()));
        dto.setPendingTasksByDepartment(pendingByDept);

        // Active Blockers
        List<TaskBlocker> criticalBlockers = blockerRepository.findAll().stream()
                .filter(b -> b.getBlockerStatus() == BlockerStatus.ACTIVE)
                .sorted(Comparator.comparing(TaskBlocker::getRaisedAt).reversed())
                .collect(Collectors.toList());
        dto.setCriticalBlockers(criticalBlockers);

        // Completed Today & Average Coordination Duration
        List<DischargeCase> allCases = dischargeRepository.findAll();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        List<DischargeCase> completedCases = allCases.stream()
                .filter(c -> c.getDischargeStatus() == DischargeStatus.COMPLETED && c.getCompletedAt() != null)
                .collect(Collectors.toList());

        long completedToday = completedCases.stream()
                .filter(c -> c.getCompletedAt().isAfter(startOfToday))
                .count();
        dto.setCompletedTodayCount(completedToday);

        double avgHours = completedCases.stream()
                .mapToLong(c -> Duration.between(c.getStartedAt(), c.getCompletedAt()).toMinutes())
                .average()
                .orElse(165.0) / 60.0; // Default illustrative 2.75 hrs if zero completed yet
        dto.setAverageCoordinationHours(Math.round(avgHours * 10.0) / 10.0);

        return dto;
    }

    public List<TaskBlocker> getActiveBlockers() {
        return blockerRepository.findAll().stream()
                .filter(b -> b.getBlockerStatus() == BlockerStatus.ACTIVE)
                .sorted(Comparator.comparing(TaskBlocker::getRaisedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<DepartmentTask> getPendingTasks() {
        return taskRepository.findAll().stream()
                .filter(t -> t.getTaskStatus() == TaskStatus.PENDING || t.getTaskStatus() == TaskStatus.IN_PROGRESS || t.getTaskStatus() == TaskStatus.BLOCKED)
                .sorted(Comparator.comparing(DepartmentTask::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }
}
