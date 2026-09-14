package com.warehouse.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DeliveryDTO {

    @Data
    public static class StatusRequest {
        @NotBlank private String status;
    }

    @Data
    public static class DeliveredRequest {
        private String notes;
        private LocalDate deliveredDate;
    }

    @Data
    public static class NotesRequest {
        private String notes;
    }

    @Data
    public static class Response {
        private Long id;
        private String deliveryNumber;
        private Long purchaseOrderId;
        private String orderNumber;
        private Long supplierId;
        private String supplierName;
        private String status;
        private LocalDate scheduledDate;
        private LocalDate deliveredDate;
        private String notes;
        private String proofImageUrl;
        private BigDecimal totalAmount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
