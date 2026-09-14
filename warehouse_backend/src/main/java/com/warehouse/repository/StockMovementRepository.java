package com.warehouse.repository;

import com.warehouse.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);
    Page<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    @Query("SELECT sm FROM StockMovement sm WHERE " +
           "(:type IS NULL OR sm.type = :type) AND " +
           "(:productId IS NULL OR sm.product.id = :productId)")
    Page<StockMovement> findWithFilters(@Param("type") StockMovement.MovementType type,
                                        @Param("productId") Long productId,
                                        Pageable pageable);

    @Query("SELECT COUNT(sm) FROM StockMovement sm WHERE sm.type = :type AND sm.createdAt >= :since AND sm.status = 'APPROVED'")
    long countByTypeAndCreatedAtAfter(@Param("type") StockMovement.MovementType type,
                                      @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(sm) FROM StockMovement sm WHERE sm.status = 'PENDING'")
    long countPending();

    @Query("SELECT sm FROM StockMovement sm ORDER BY sm.createdAt DESC")
    List<StockMovement> findRecentMovements(Pageable pageable);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%b') as month, " +
                   "SUM(CASE WHEN type = 'STOCK_IN' THEN quantity ELSE 0 END) as stockIn, " +
                   "SUM(CASE WHEN type = 'STOCK_OUT' THEN quantity ELSE 0 END) as stockOut " +
                   "FROM stock_movements WHERE created_at >= :since AND status = 'APPROVED' " +
                   "GROUP BY DATE_FORMAT(created_at, '%b'), DATE_FORMAT(created_at, '%Y-%m') " +
                   "ORDER BY DATE_FORMAT(created_at, '%Y-%m')", nativeQuery = true)
    List<Object[]> getMonthlyMovements(@Param("since") LocalDateTime since);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.createdAt BETWEEN :start AND :end")
    List<StockMovement> findByDateRange(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.type = :type AND sm.createdAt BETWEEN :start AND :end")
    List<StockMovement> findByTypeAndDateRange(@Param("type") StockMovement.MovementType type,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);
}
