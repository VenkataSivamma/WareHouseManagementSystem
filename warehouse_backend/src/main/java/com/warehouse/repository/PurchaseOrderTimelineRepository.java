package com.warehouse.repository;

import com.warehouse.entity.PurchaseOrderTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderTimelineRepository extends JpaRepository<PurchaseOrderTimeline, Long> {
    List<PurchaseOrderTimeline> findByPurchaseOrderIdOrderByChangedAtAsc(Long purchaseOrderId);
}
