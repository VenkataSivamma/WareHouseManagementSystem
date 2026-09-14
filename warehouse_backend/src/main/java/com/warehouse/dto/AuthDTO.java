package com.warehouse.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        // accepts either "email" or "identifier" (employee ID or email for staff)
        private String email;
        private String identifier;
        @NotBlank
        private String password;

        public String resolvedEmail() {
            return (email != null && !email.isBlank()) ? email : identifier;
        }
    }

    @Data
    public static class RegisterManagerRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
        private String phone;
        private String employeeId;
        private String department;
        private String warehouseLocation;
    }

    @Data
    public static class RegisterSupplierRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
        private String phone;
        @NotBlank private String companyName;
        private String address;
        private String contactPerson;
        private String taxId;
    }

    @Data
    public static class UpdateProfileRequest {
        private String name;
        private String fullName;   // alias — frontend sends fullName
        private String phone;
        private String address;
        private String companyName;
        private String contactPerson;
        private String bankAccount;
        private String department;
        private String warehouseLocation;

        public String resolvedName() {
            return (name != null && !name.isBlank()) ? name : fullName;
        }
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank private String currentPassword;
        @NotBlank @Size(min = 6) private String newPassword;
    }

    @Data
    public static class ForgotPasswordRequest {
        @NotBlank @Email private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank private String token;
        @NotBlank @Size(min = 6) private String newPassword;
    }

    @Data
    public static class UserResponse {
        private Long id;
        private String name;
        private String fullName;   // alias for name
        private String email;
        private String role;
        private String phone;
        private String status;     // lowercase: active / inactive
        private String companyName;
        private String employeeId;
        private String department;
        private String warehouseLocation;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime updatedAt;
    }

    @Data
    public static class AuthResponse {
        private UserResponse user;
        private String token;
    }
}
