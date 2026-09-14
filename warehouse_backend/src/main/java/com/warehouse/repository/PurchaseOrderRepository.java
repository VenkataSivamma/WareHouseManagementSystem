package com.warehouse.repository;

import com.warehouse.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "(:status IS NULL OR po.status = :status) AND " +
           "(:supplierId IS NULL OR po.supplier.id = :supplierId) AND " +
           "(:search IS NULL OR LOWER(po.orderNumber) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<PurchaseOrder> findWithFilters(@Param("status") PurchaseOrder.OrderStatus status,
                                        @Param("supplierId") Long supplierId,
                                        @Param("search") String search,
                                        Pageable pageable);

    List<PurchaseOrder> findBySupplierId(Long supplierId);

    List<PurchaseOrder> findByOrderNumberContainingIgnoreCase(String query);

    long countByStatus(PurchaseOrder.OrderStatus status);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.createdAt >= :since")
    long countCreatedSince(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(po.totalAmount) FROM PurchaseOrder po WHERE po.status = 'COMPLETED' AND po.createdAt >= :since")
    java.math.BigDecimal sumRevenueCompletedSince(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(po.totalAmount) FROM PurchaseOrder po WHERE po.supplier.id = :supplierId AND po.status = 'COMPLETED'")
    java.math.BigDecimal sumRevenueBySupplier(@Param("supplierId") Long supplierId);

    List<PurchaseOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
