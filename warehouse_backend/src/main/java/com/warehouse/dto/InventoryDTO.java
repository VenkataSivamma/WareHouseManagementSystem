package com.warehouse.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

public class InventoryDTO {

    @Data
    public static class Response {
        private Long id;
        private Long productId;
        private String productName;
        private String sku;
        private String categoryName;
        private Integer availableQuantity;
        private Integer reservedQuantity;
        private Integer damagedQuantity;
        private String status;
        private Integer minStock;
        private LocalDateTime lastUpdated;
    }

    @Data
    public static class StockRequest {
        @NotNull private Long productId;
        @NotNull @Min(1) private Integer quantity;
        private String reason;
        private String remarks;   // alias for reason (frontend StockIn sends remarks)
        private String notes;
        private String referenceNumber;

        public String resolvedReason() {
            return (reason != null && !reason.isBlank()) ? reason : remarks;
        }
    }

    @Data
    public static class RejectRequest {
        @NotBlank private String reason;
    }

    @Data
    public static class StockMovementResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String sku;
        private String type;          // display: "Stock In" / "Stock Out"
        private String typeRaw;       // raw enum: STOCK_IN / STOCK_OUT
        private Integer quantity;
        private String reason;
        private String notes;
        private String status;        // lowercase
        private String referenceNumber;
        private String performedBy;
        private String approvedBy;
        private LocalDateTime createdAt;
    }
}
