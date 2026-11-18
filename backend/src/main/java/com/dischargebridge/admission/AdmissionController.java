package com.dischargebridge.admission;

import com.dischargebridge.admission.dto.CreateAdmissionRequest;
import com.dischargebridge.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
@Tag(name = "Admissions", description = "Patient Admission Management")
public class AdmissionController {

    private final AdmissionService admissionService;

    public AdmissionController(AdmissionService admissionService) {
        this.admissionService = admissionService;
    }

    @GetMapping
    @Operation(summary = "List Admissions", description = "Retrieves all patient hospital admissions")
    public ResponseEntity<ApiResponse<List<Admission>>> listAdmissions() {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.getAllAdmissions()));
    }

    @GetMapping("/active")
    @Operation(summary = "List Active Admissions", description = "Retrieves currently admitted patients")
    public ResponseEntity<ApiResponse<List<Admission>>> listActiveAdmissions() {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.getActiveAdmissions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Admission", description = "Retrieves an admission record by ID")
    public ResponseEntity<ApiResponse<Admission>> getAdmission(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.getAdmissionById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search Admissions", description = "Searches admissions by admission reference or patient name")
    public ResponseEntity<ApiResponse<List<Admission>>> searchAdmissions(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(ApiResponse.ok(admissionService.searchAdmissions(query)));
    }

    @PostMapping
    @Operation(summary = "Create Admission", description = "Creates a new synthetic admission for demo/testing")
    public ResponseEntity<ApiResponse<Admission>> createAdmission(@Valid @RequestBody CreateAdmissionRequest request) {
        Admission created = admissionService.createAdmission(request);
        return ResponseEntity.ok(ApiResponse.ok("Admission created successfully", created));
    }
}
