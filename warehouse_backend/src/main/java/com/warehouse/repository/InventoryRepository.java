package com.warehouse.repository;

import com.warehouse.entity.Inventory;
import com.warehouse.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProduct(Product product);
    Optional<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i JOIN i.product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%',:search,'%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:status IS NULL OR i.status = :status)")
    Page<Inventory> findWithFilters(@Param("search") String search,
                                    @Param("categoryId") Long categoryId,
                                    @Param("status") String status,
                                    Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.status = 'available'")
    Page<Inventory> findAvailable(Pageable pageable);

    @Query("SELECT i FROM Inventory i JOIN i.product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%'))) AND i.status = 'available'")
    Page<Inventory> findAvailableWithSearch(@Param("search") String search, Pageable pageable);

    List<Inventory> findByStatus(String status);

    @Query("SELECT i FROM Inventory i WHERE i.availableQuantity <= i.product.minStock")
    List<Inventory> findLowStock();

    @Query("SELECT SUM(i.availableQuantity) FROM Inventory i")
    Long sumAvailableQuantity();

    @Query("SELECT SUM(i.availableQuantity * p.costPrice) FROM Inventory i JOIN i.product p")
    java.math.BigDecimal sumInventoryValue();
}
