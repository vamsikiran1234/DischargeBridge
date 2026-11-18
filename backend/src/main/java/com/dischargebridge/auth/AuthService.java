package com.dischargebridge.auth;

import com.dischargebridge.auth.dto.AuthResponse;
import com.dischargebridge.auth.dto.LoginRequest;
import com.dischargebridge.auth.dto.RegisterRequest;
import com.dischargebridge.department.Department;
import com.dischargebridge.department.DepartmentRepository;
import com.dischargebridge.user.HospitalUser;
import com.dischargebridge.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        HospitalUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive()) {
            throw new IllegalStateException("Account is inactive. Please contact your hospital administrator.");
        }

        String jwt = jwtService.generateToken(user);
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : null;

        return new AuthResponse(jwt, user.getId(), user.getFullName(), user.getEmail(), user.getRole(), deptId, deptName);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + request.getDepartmentId()));
        }

        HospitalUser newUser = new HospitalUser(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole(),
                department
        );

        HospitalUser savedUser = userRepository.save(newUser);
        String jwt = jwtService.generateToken(savedUser);
        Long deptId = savedUser.getDepartment() != null ? savedUser.getDepartment().getId() : null;
        String deptName = savedUser.getDepartment() != null ? savedUser.getDepartment().getName() : null;

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole(), deptId, deptName);
    }

    public AuthResponse getCurrentUserProfile(String email) {
        HospitalUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String jwt = jwtService.generateToken(user);
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : null;
        return new AuthResponse(jwt, user.getId(), user.getFullName(), user.getEmail(), user.getRole(), deptId, deptName);
    }
}
