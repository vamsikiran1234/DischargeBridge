package com.dischargebridge.task;

import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.common.ApiResponse;
import com.dischargebridge.task.dto.RaiseBlockerRequest;
import com.dischargebridge.task.dto.ResolveBlockerRequest;
import com.dischargebridge.task.dto.UpdateTaskStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Department Tasks & Blockers", description = "Task Execution and Blocker Resolution")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/tasks/my-tasks")
    @Operation(summary = "My Department Tasks", description = "Retrieves tasks assigned to the logged-in staff member or their department")
    public ResponseEntity<ApiResponse<List<DepartmentTask>>> getMyTasks(@AuthenticationPrincipal UserDetails userDetails) {
        List<DepartmentTask> tasks = taskService.getTasksForUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @GetMapping("/tasks/{id}")
    @Operation(summary = "View Task", description = "Retrieves department task details")
    public ResponseEntity<ApiResponse<DepartmentTask>> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTaskById(id)));
    }

    @PatchMapping("/tasks/{id}/status")
    @Operation(summary = "Update Task Status", description = "Updates task status (PENDING, IN_PROGRESS, COMPLETED)")
    public ResponseEntity<ApiResponse<DepartmentTask>> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        DepartmentTask updated = taskService.updateTaskStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Task status updated successfully", updated));
    }

    @PostMapping("/tasks/{id}/assign")
    @Operation(summary = "Assign Task", description = "Assigns task to a department staff member")
    public ResponseEntity<ApiResponse<DepartmentTask>> assignTask(
            @PathVariable Long id,
            @RequestParam Long assignToUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        DepartmentTask updated = taskService.assignTask(id, assignToUserId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Task assigned successfully", updated));
    }

    @PostMapping("/tasks/{id}/blockers")
    @Operation(summary = "Raise a Blocker", description = "Flags an operational bottleneck and halts task progression")
    public ResponseEntity<ApiResponse<TaskBlocker>> raiseBlocker(
            @PathVariable Long id,
            @Valid @RequestBody RaiseBlockerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskBlocker blocker = taskService.raiseBlocker(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Blocker registered successfully", blocker));
    }

    @PatchMapping("/blockers/{id}/resolve")
    @Operation(summary = "Resolve Blocker", description = "Resolves an active blocker and returns the task to active workflow")
    public ResponseEntity<ApiResponse<TaskBlocker>> resolveBlocker(
            @PathVariable Long id,
            @RequestBody(required = false) ResolveBlockerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskBlocker resolved = taskService.resolveBlocker(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Blocker resolved successfully", resolved));
    }
}
