package com.warehouse.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

public class CategoryDTO {

    @Data
    public static class Request {
        @NotBlank private String name;
        private String description;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String status;
        private long productCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
