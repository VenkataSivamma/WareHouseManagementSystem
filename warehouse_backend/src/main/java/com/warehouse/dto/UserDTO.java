package com.warehouse.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

public class UserDTO {

    @Data
    public static class CreateRequest {
        private String name;
        private String fullName;   // frontend sends fullName
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
        private String phone;
        private String employeeId;
        private String department;
        private String warehouseLocation;

        public String resolvedName() {
            String n = (name != null && !name.isBlank()) ? name : fullName;
            return (n != null && !n.isBlank()) ? n : email; // fallback to email prefix
        }
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private String fullName;   // frontend sends fullName
        private String phone;
        private String employeeId;
        private String department;
        private String warehouseLocation;

        public String resolvedName() {
            return (name != null && !name.isBlank()) ? name : fullName;
        }
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String fullName;   // alias for name
        private String email;
        private String phone;
        private String role;
        private String status;     // lowercase
        private String employeeId;
        private String department;
        private String warehouseLocation;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
