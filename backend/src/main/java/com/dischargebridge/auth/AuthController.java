package com.dischargebridge.auth;

import com.dischargebridge.auth.dto.AuthResponse;
import com.dischargebridge.auth.dto.LoginRequest;
import com.dischargebridge.auth.dto.RegisterRequest;
import com.dischargebridge.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Authentication & Staff", description = "Authentication and Staff Profile Endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    @Operation(summary = "Staff Login", description = "Authenticates hospital staff and returns a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/auth/register")
    @Operation(summary = "Create Staff Account", description = "Admin-only endpoint to onboard new hospital personnel")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Staff account created successfully", response));
    }

    @GetMapping("/users/me")
    @Operation(summary = "Current Staff Profile", description = "Fetches the profile and role details of the logged-in staff member")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        AuthResponse response = authService.getCurrentUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
