package com.dischargebridge.discharge;

import com.dischargebridge.blocker.BlockerRepository;
import com.dischargebridge.blocker.BlockerStatus;
import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.discharge.dto.DischargeReadinessDto;
import com.dischargebridge.task.DepartmentTask;
import com.dischargebridge.task.TaskRepository;
import com.dischargebridge.task.TaskStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReadinessService {

    private final TaskRepository taskRepository;
    private final BlockerRepository blockerRepository;

    public ReadinessService(TaskRepository taskRepository, BlockerRepository blockerRepository) {
        this.taskRepository = taskRepository;
        this.blockerRepository = blockerRepository;
    }

    public DischargeReadinessDto calculateReadiness(DischargeCase dischargeCase) {
        DischargeReadinessDto dto = new DischargeReadinessDto();
        dto.setDischargeId(dischargeCase.getId());
        dto.setStatus(dischargeCase.getDischargeStatus());
        dto.setMedicalClearanceGranted(dischargeCase.getMedicalClearanceAt() != null);

        long elapsedMinutes = Duration.between(dischargeCase.getStartedAt(),
                dischargeCase.getCompletedAt() != null ? dischargeCase.getCompletedAt() : LocalDateTime.now()).toMinutes();
        dto.setElapsedMinutes(Math.max(0, elapsedMinutes));

        List<DepartmentTask> tasks = taskRepository.findByDischargeCaseId(dischargeCase.getId());
        List<TaskBlocker> activeBlockers = blockerRepository.findByDischargeCaseId(dischargeCase.getId()).stream()
                .filter(b -> b.getBlockerStatus() == BlockerStatus.ACTIVE)
                .collect(Collectors.toList());

        int mandatoryCount = 0;
        int completedCount = 0;
        int pendingCount = 0;
        int blockedCount = activeBlockers.size();

        Map<String, List<DepartmentTask>> deptMap = new LinkedHashMap<>();
        for (DepartmentTask t : tasks) {
            String deptCode = t.getDepartment().getCode();
            deptMap.computeIfAbsent(deptCode, k -> new ArrayList<>()).add(t);

            if (t.isMandatory()) {
                mandatoryCount++;
                if (t.getTaskStatus() == TaskStatus.COMPLETED) {
                    completedCount++;
                } else if (t.getTaskStatus() == TaskStatus.BLOCKED) {
                    // blocked
                } else {
                    pendingCount++;
                }
            }
        }

        dto.setMandatoryTasks(mandatoryCount);
        dto.setCompletedTasks(completedCount);
        dto.setPendingTasks(pendingCount);
        dto.setBlockedTasks(blockedCount);

        // A discharge is ready for final handover ONLY IF:
        // 1. Doctor has recorded medical clearance
        // 2. All mandatory tasks are COMPLETED
        // 3. There are zero active blockers
        boolean allMandatoryCompleted = (mandatoryCount > 0 && completedCount == mandatoryCount);
        boolean readyForHandover = dto.isMedicalClearanceGranted() && allMandatoryCompleted && (blockedCount == 0);
        dto.setReadyForFinalHandover(readyForHandover);

        // Build departmental breakdown
        List<DischargeReadinessDto.DepartmentStatusSummary> summaries = new ArrayList<>();
        for (Map.Entry<String, List<DepartmentTask>> entry : deptMap.entrySet()) {
            String code = entry.getKey();
            List<DepartmentTask> deptTasks = entry.getValue();
            String name = deptTasks.get(0).getDepartment().getName();

            int total = deptTasks.size();
            int comp = (int) deptTasks.stream().filter(t -> t.getTaskStatus() == TaskStatus.COMPLETED).count();
            boolean isDeptBlocked = deptTasks.stream().anyMatch(t -> t.getTaskStatus() == TaskStatus.BLOCKED);

            String statusStr;
            String activeBlockReason = null;
            if (isDeptBlocked) {
                statusStr = "BLOCKED";
                Optional<TaskBlocker> block = activeBlockers.stream()
                        .filter(b -> b.getTask().getDepartment().getCode().equalsIgnoreCase(code))
                        .findFirst();
                if (block.isPresent()) {
                    activeBlockReason = block.get().getReason();
                }
            } else if (comp == total && total > 0) {
                statusStr = "COMPLETED";
            } else if (deptTasks.stream().anyMatch(t -> t.getTaskStatus() == TaskStatus.IN_PROGRESS)) {
                statusStr = "IN_PROGRESS";
            } else {
                statusStr = "PENDING";
            }

            summaries.add(new DischargeReadinessDto.DepartmentStatusSummary(
                    code, name, statusStr, total, comp, isDeptBlocked, activeBlockReason
            ));
        }
        dto.setDepartments(summaries);

        return dto;
    }
}
