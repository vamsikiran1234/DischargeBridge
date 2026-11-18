package com.dischargebridge.department;

import com.dischargebridge.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments", description = "Hospital Department Registry")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @Operation(summary = "List Departments", description = "Lists all active hospital departments")
    public ResponseEntity<ApiResponse<List<Department>>> listDepartments() {
        List<Department> departments = departmentService.getAllActiveDepartments();
        return ResponseEntity.ok(ApiResponse.ok(departments));
    }
}
