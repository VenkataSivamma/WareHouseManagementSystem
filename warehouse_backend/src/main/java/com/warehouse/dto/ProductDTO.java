package com.warehouse.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDTO {

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String sku;
        private String barcode;
        private BigDecimal price;
        private BigDecimal costPrice;
        private Integer minStock;
        private Integer maxStock;
        private String imageUrl;
        private String status;
        private Long categoryId;
        private String categoryName;
        private Long supplierId;
        private String supplierName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
