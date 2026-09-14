package com.warehouse.controller;

import com.warehouse.dto.AuthDTO;
import com.warehouse.entity.User;
import com.warehouse.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/admin/login")
    public ResponseEntity<AuthDTO.AuthResponse> adminLogin(@Valid @RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.resolvedEmail(), req.getPassword(), User.Role.ADMIN));
    }

    @PostMapping("/manager/login")
    public ResponseEntity<AuthDTO.AuthResponse> managerLogin(@Valid @RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.resolvedEmail(), req.getPassword(), User.Role.MANAGER));
    }

    @PostMapping("/staff/login")
    public ResponseEntity<AuthDTO.AuthResponse> staffLogin(@Valid @RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(authService.staffLogin(req.resolvedEmail(), req.getPassword()));
    }

    @PostMapping("/supplier/login")
    public ResponseEntity<AuthDTO.AuthResponse> supplierLogin(@Valid @RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.resolvedEmail(), req.getPassword(), User.Role.SUPPLIER));
    }

    @PostMapping("/register/manager")
    public ResponseEntity<Map<String, Object>> registerManager(@Valid @RequestBody AuthDTO.RegisterManagerRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Managers must be created by an administrator"));
    }

    @PostMapping("/register/supplier")
    public ResponseEntity<Map<String, Object>> registerSupplier(@Valid @RequestBody AuthDTO.RegisterSupplierRequest req) {
        AuthDTO.AuthResponse res = authService.registerSupplier(req);
        return ResponseEntity.status(201).body(Map.of("message", "Supplier registered successfully", "user", res.getUser()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthDTO.UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.toUserResponse(authService.getCurrentUser(userDetails.getUsername())));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthDTO.UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AuthDTO.UpdateProfileRequest req) {
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), req));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AuthDTO.ChangePasswordRequest req) {
        authService.changePassword(userDetails.getUsername(), req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody AuthDTO.ForgotPasswordRequest req) {
        authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(Map.of("message", "Password reset instructions sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody AuthDTO.ResetPasswordRequest req) {
        authService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
