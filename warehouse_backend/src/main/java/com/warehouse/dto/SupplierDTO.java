package com.warehouse.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

public class SupplierDTO {

    @Data
    public static class CreateRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank @Size(min = 6) private String password;
        private String phone;
        @NotBlank private String companyName;
        private String address;
        private String companyAddress;  // alias for address
        private String contactPerson;
        private String taxId;
        private String gstNumber;       // alias for taxId

        public String resolvedAddress() {
            return (address != null && !address.isBlank()) ? address : companyAddress;
        }
        public String resolvedTaxId() {
            return (taxId != null && !taxId.isBlank()) ? taxId : gstNumber;
        }
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private String phone;
        private String companyName;
        private String address;
        private String companyAddress;  // alias for address
        private String contactPerson;
        private String taxId;
        private String gstNumber;       // alias for taxId
        private String bankAccount;

        public String resolvedAddress() {
            return (address != null && !address.isBlank()) ? address : companyAddress;
        }
        public String resolvedTaxId() {
            return (taxId != null && !taxId.isBlank()) ? taxId : gstNumber;
        }
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String companyName;
        private String address;
        private String companyAddress;  // alias for address
        private String contactPerson;
        private String taxId;
        private String gstNumber;       // alias for taxId
        private String bankAccount;
        private String status;          // lowercase
        private Double rating;
        private Integer totalOrders;
        private LocalDateTime createdAt;
    }
}
