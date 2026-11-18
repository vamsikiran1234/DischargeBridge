package com.dischargebridge.dashboard;

import com.dischargebridge.blocker.TaskBlocker;
import com.dischargebridge.common.ApiResponse;
import com.dischargebridge.task.DepartmentTask;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Coordinator Dashboard", description = "Central Discharge Readiness Board & Blocker Intelligence")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Discharge Readiness Board Overview", description = "Summary of active discharges, pending tasks, blockers, and departmental metrics")
    public ResponseEntity<ApiResponse<DashboardOverviewDto>> getDashboardOverview() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getOverview()));
    }

    @GetMapping("/blocked")
    @Operation(summary = "Critical Discharges with Active Blockers", description = "Lists all workflows currently halted by operational blockers")
    public ResponseEntity<ApiResponse<List<TaskBlocker>>> getActiveBlockers() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getActiveBlockers()));
    }

    @GetMapping("/pending-tasks")
    @Operation(summary = "Pending Department Tasks", description = "Lists all pending tasks across departments")
    public ResponseEntity<ApiResponse<List<DepartmentTask>>> getPendingTasks() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getPendingTasks()));
    }
}
