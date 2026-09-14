package com.warehouse.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderDTO {

    @Data
    public static class ItemRequest {
        @NotNull private Long productId;
        @NotNull @Min(1) private Integer quantity;
        @NotNull private BigDecimal unitPrice;
    }

    // Simplified request shape from manager frontend:
    // { supplierId, productId, quantity, estimatedCost, notes }
    @Data
    public static class SimpleCreateRequest {
        @NotNull private Long supplierId;
        @NotNull private Long productId;
        @NotNull @Min(1) private Integer quantity;
        private BigDecimal estimatedCost;   // used as unitPrice
        private BigDecimal unitPrice;       // alternative field name
        private String notes;
        private LocalDate expectedDeliveryDate;

        public BigDecimal resolvedUnitPrice() {
            return (unitPrice != null) ? unitPrice : (estimatedCost != null ? estimatedCost : BigDecimal.ZERO);
        }
    }

    @Data
    public static class CreateRequest {
        @NotNull private Long supplierId;
        @NotEmpty private List<ItemRequest> items;
        private String notes;
        private LocalDate expectedDeliveryDate;
    }

    @Data
    public static class RejectRequest {
        @NotBlank private String reason;
    }

    @Data
    public static class AssignSupplierRequest {
        @NotNull private Long supplierId;
    }

    @Data
    public static class ItemResponse {
        private Long productId;
        private String productName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    public static class Response {
        private Long id;
        private String orderNumber;
        private String orderNo;         // alias for orderNumber
        private Long supplierId;
        private String supplierName;
        private Long createdById;
        private String createdByName;
        private String status;          // lowercase
        private BigDecimal totalAmount;
        private String notes;
        private LocalDate expectedDeliveryDate;
        private List<ItemResponse> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class TimelineResponse {
        private Long id;
        private String status;
        private String note;
        private String changedByName;
        private LocalDateTime changedAt;
    }
}
