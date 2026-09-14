package com.warehouse.repository;

import com.warehouse.entity.Delivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findBySupplierId(Long supplierId);

    @Query("SELECT d FROM Delivery d WHERE (:status IS NULL OR d.status = :status)")
    Page<Delivery> findWithStatus(@Param("status") Delivery.DeliveryStatus status, Pageable pageable);

    @Query("SELECT d FROM Delivery d WHERE d.createdAt BETWEEN :start AND :end")
    Page<Delivery> findHistory(@Param("start") java.time.LocalDateTime start,
                               @Param("end") java.time.LocalDateTime end,
                               Pageable pageable);

    long countBySupplierIdAndStatus(Long supplierId, Delivery.DeliveryStatus status);
    long countBySupplierId(Long supplierId);
}
