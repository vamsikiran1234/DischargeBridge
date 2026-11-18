package com.dischargebridge.discharge;

import com.dischargebridge.audit.AuditLog;
import com.dischargebridge.audit.AuditService;
import com.dischargebridge.common.ApiResponse;
import com.dischargebridge.discharge.dto.DischargeCaseDetailDto;
import com.dischargebridge.discharge.dto.DischargeReadinessDto;
import com.dischargebridge.discharge.dto.InitiateDischargeRequest;
import com.dischargebridge.discharge.dto.MedicalClearanceRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discharges")
@Tag(name = "Discharge Workflow", description = "Patient Discharge Workflow & Readiness Management")
public class DischargeController {

    private final DischargeService dischargeService;
    private final AuditService auditService;

    public DischargeController(DischargeService dischargeService, AuditService auditService) {
        this.dischargeService = dischargeService;
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "List Discharges", description = "Lists recent discharge workflows")
    public ResponseEntity<ApiResponse<List<DischargeCase>>> listDischarges() {
        return ResponseEntity.ok(ApiResponse.ok(dischargeService.getAllDischarges()));
    }

    @GetMapping("/active")
    @Operation(summary = "List Active Discharges", description = "Lists non-completed, active discharge workflows")
    public ResponseEntity<ApiResponse<List<DischargeCase>>> listActiveDischarges() {
        return ResponseEntity.ok(ApiResponse.ok(dischargeService.getActiveDischarges()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Discharge Details", description = "Retrieves complete discharge details, tasks, blockers, and history")
    public ResponseEntity<ApiResponse<DischargeCaseDetailDto>> getDischargeDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dischargeService.getDischargeDetails(id)));
    }

    @GetMapping("/{id}/readiness")
    @Operation(summary = "Get Readiness Summary", description = "Computes real-time discharge readiness calculation")
    public ResponseEntity<ApiResponse<DischargeReadinessDto>> getReadiness(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dischargeService.getReadinessSummary(id)));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get Case Audit History", description = "Retrieves immutable audit history for the discharge case")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getCaseAuditHistory(id)));
    }

    @PostMapping
    @Operation(summary = "Initiate Discharge Workflow", description = "Starts the discharge workflow and creates department tasks")
    public ResponseEntity<ApiResponse<DischargeCase>> initiateDischarge(
            @Valid @RequestBody InitiateDischargeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        DischargeCase dc = dischargeService.initiateDischarge(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Discharge workflow initiated successfully", dc));
    }

    @PostMapping("/{id}/medical-clearance")
    @Operation(summary = "Record Clinician Clearance", description = "Authorized doctor records clinical discharge clearance")
    public ResponseEntity<ApiResponse<DischargeCase>> recordMedicalClearance(
            @PathVariable Long id,
            @Valid @RequestBody MedicalClearanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        DischargeCase dc = dischargeService.recordMedicalClearance(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Medical clearance recorded successfully", dc));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Final Authorized Completion", description = "Coordinator records final physical discharge handover")
    public ResponseEntity<ApiResponse<DischargeCase>> completeDischarge(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        DischargeCase dc = dischargeService.completeFinalHandover(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Discharge completed and bed released successfully", dc));
    }
}
