package com.warehouse.repository;

import com.warehouse.entity.Category;
import com.warehouse.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    boolean existsBySku(String sku);
    boolean existsByBarcode(String barcode);

    List<Product> findByCategory(Category category);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%',:search,'%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Product> findWithFilters(@Param("search") String search,
                                  @Param("categoryId") Long categoryId,
                                  @Param("status") Product.ProductStatus status,
                                  Pageable pageable);

    List<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku);

    @Query("SELECT p FROM Product p JOIN Inventory i ON i.product = p WHERE i.availableQuantity <= p.minStock")
    List<Product> findLowStockProducts();

    long countByStatus(Product.ProductStatus status);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.createdAt >= :since")
    long countCreatedSince(@Param("since") LocalDateTime since);
}
