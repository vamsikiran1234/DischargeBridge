package com.dischargebridge.task;

import com.dischargebridge.audit.AuditService;
import com.dischargebridge.blocker.BlockerRepository;
import com.dischargebridge.blocker.BlockerStatus;
import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.discharge.DischargeCase;
import com.dischargebridge.discharge.DischargeRepository;
import com.dischargebridge.discharge.DischargeStatus;
import com.dischargebridge.discharge.ReadinessService;
import com.dischargebridge.discharge.dto.DischargeReadinessDto;
import com.dischargebridge.task.dto.RaiseBlockerRequest;
import com.dischargebridge.task.dto.ResolveBlockerRequest;
import com.dischargebridge.task.dto.UpdateTaskStatusRequest;
import com.dischargebridge.user.HospitalUser;
import com.dischargebridge.user.Role;
import com.dischargebridge.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final BlockerRepository blockerRepository;
    private final DischargeRepository dischargeRepository;
    private final UserRepository userRepository;
    private final ReadinessService readinessService;
    private final AuditService auditService;

    public TaskService(TaskRepository taskRepository,
                       BlockerRepository blockerRepository,
                       DischargeRepository dischargeRepository,
                       UserRepository userRepository,
                       ReadinessService readinessService,
                       AuditService auditService) {
        this.taskRepository = taskRepository;
        this.blockerRepository = blockerRepository;
        this.dischargeRepository = dischargeRepository;
        this.userRepository = userRepository;
        this.readinessService = readinessService;
        this.auditService = auditService;
    }

    public List<DepartmentTask> getTasksForUser(String userEmail) {
        HospitalUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.COORDINATOR || user.getRole() == Role.ADMIN) {
            return taskRepository.findAll();
        }

        if (user.getDepartment() != null) {
            return taskRepository.findByDepartmentId(user.getDepartment().getId());
        }

        return taskRepository.findByAssignedToId(user.getId());
    }

    public DepartmentTask getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
    }

    @Transactional
    public DepartmentTask updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, String userEmail) {
        HospitalUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DepartmentTask task = getTaskById(taskId);
        String oldStatus = task.getTaskStatus().name();

        if (task.getTaskStatus() == TaskStatus.COMPLETED && request.getStatus() != TaskStatus.COMPLETED) {
            if (user.getRole() != Role.ADMIN && user.getRole() != Role.COORDINATOR) {
                throw new IllegalStateException("A completed task cannot silently be reverted back to pending without coordinator authorization.");
            }
        }

        task.setTaskStatus(request.getStatus());
        if (request.getNotes() != null) {
            task.setCompletionNotes(request.getNotes());
        }

        if (request.getStatus() == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
            task.setCompletedBy(user);
        }

        DepartmentTask saved = taskRepository.save(task);

        // Update overall case status
        recalculateAndSyncCaseStatus(task.getDischargeCase());

        // Audit Record
        auditService.record(task.getDischargeCaseId(), user, "UPDATE_TASK_STATUS", "DepartmentTask", task.getId(), oldStatus, saved.getTaskStatus().name());

        return saved;
    }

    @Transactional
    public DepartmentTask assignTask(Long taskId, Long assignToUserId, String userEmail) {
        HospitalUser actor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DepartmentTask task = getTaskById(taskId);
        HospitalUser assignee = userRepository.findById(assignToUserId)
                .orElseThrow(() -> new IllegalArgumentException("Assignee user not found"));

        String oldAssignee = task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : "Unassigned";
        task.setAssignedTo(assignee);
        DepartmentTask saved = taskRepository.save(task);

        auditService.record(task.getDischargeCaseId(), actor, "ASSIGN_TASK", "DepartmentTask", task.getId(), oldAssignee, assignee.getFullName());

        return saved;
    }

    @Transactional
    public TaskBlocker raiseBlocker(Long taskId, RaiseBlockerRequest request, String userEmail) {
        HospitalUser actor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DepartmentTask task = getTaskById(taskId);
        task.setTaskStatus(TaskStatus.BLOCKED);
        taskRepository.save(task);

        TaskBlocker blocker = new TaskBlocker(task, actor, request.getReason());
        TaskBlocker savedBlocker = blockerRepository.save(blocker);

        // Update Case status to BLOCKED
        DischargeCase dc = task.getDischargeCase();
        String oldCaseStatus = dc.getDischargeStatus().name();
        dc.setDischargeStatus(DischargeStatus.BLOCKED);
        dischargeRepository.save(dc);

        auditService.record(dc.getId(), actor, "RAISE_BLOCKER", "TaskBlocker", savedBlocker.getId(), null, request.getReason());

        return savedBlocker;
    }

    @Transactional
    public TaskBlocker resolveBlocker(Long blockerId, ResolveBlockerRequest request, String userEmail) {
        HospitalUser actor = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TaskBlocker blocker = blockerRepository.findById(blockerId)
                .orElseThrow(() -> new IllegalArgumentException("Blocker not found with ID: " + blockerId));

        if (blocker.getBlockerStatus() == BlockerStatus.RESOLVED) {
            throw new IllegalStateException("Blocker is already resolved.");
        }

        blocker.setBlockerStatus(BlockerStatus.RESOLVED);
        blocker.setResolvedBy(actor);
        blocker.setResolvedAt(LocalDateTime.now());
        if (request != null && request.getResolutionNotes() != null) {
            blocker.setResolutionNotes(request.getResolutionNotes());
        }
        TaskBlocker savedBlocker = blockerRepository.save(blocker);

        // Set task back to IN_PROGRESS
        DepartmentTask task = blocker.getTask();
        task.setTaskStatus(TaskStatus.IN_PROGRESS);
        taskRepository.save(task);

        // Recalculate case status
        recalculateAndSyncCaseStatus(task.getDischargeCase());

        auditService.record(task.getDischargeCaseId(), actor, "RESOLVE_BLOCKER", "TaskBlocker", savedBlocker.getId(), "ACTIVE", "RESOLVED");

        return savedBlocker;
    }

    private void recalculateAndSyncCaseStatus(DischargeCase dc) {
        DischargeReadinessDto readiness = readinessService.calculateReadiness(dc);
        if (readiness.isReadyForFinalHandover()) {
            dc.setDischargeStatus(DischargeStatus.READY_FOR_FINAL_HANDOVER);
        } else if (readiness.getBlockedTasks() > 0) {
            dc.setDischargeStatus(DischargeStatus.BLOCKED);
        } else if (dc.getMedicalClearanceAt() != null) {
            dc.setDischargeStatus(DischargeStatus.IN_PROGRESS);
        } else {
            dc.setDischargeStatus(DischargeStatus.INITIATED);
        }
        dischargeRepository.save(dc);
    }
}
