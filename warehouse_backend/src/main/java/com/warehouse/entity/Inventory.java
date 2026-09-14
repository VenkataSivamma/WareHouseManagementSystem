package com.warehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", unique = true)
    private Product product;

    @Builder.Default
    private Integer availableQuantity = 0;

    @Builder.Default
    private Integer reservedQuantity = 0;

    @Builder.Default
    private Integer damagedQuantity = 0;

    private String status;

    private LocalDateTime lastUpdated;

    public void recomputeStatus() {
        if (product != null && product.getMinStock() != null
                && availableQuantity <= product.getMinStock()) {
            this.status = "low";
        } else {
            this.status = "available";
        }
        this.lastUpdated = LocalDateTime.now();
    }
}
