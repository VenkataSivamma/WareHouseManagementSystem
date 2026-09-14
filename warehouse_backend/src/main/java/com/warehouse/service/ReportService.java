package com.warehouse.service;

import com.warehouse.entity.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository movementRepository;
    private final PurchaseOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public Map<String, Object> getInventoryReport(LocalDate startDate, LocalDate endDate) {
        List<Inventory> all = inventoryRepository.findAll();
        long totalItems = all.size();
        long lowStock = all.stream().filter(i -> "low".equals(i.getStatus())).count();
        long totalAvailable = all.stream().mapToLong(i -> i.getAvailableQuantity()).sum();
        BigDecimal totalValue = inventoryRepository.sumInventoryValue();

        List<Map<String, Object>> items = all.stream().map(inv -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("productName", inv.getProduct().getName());
            m.put("sku", inv.getProduct().getSku());
            m.put("category", inv.getProduct().getCategory() != null ? inv.getProduct().getCategory().getName() : "");
            m.put("available", inv.getAvailableQuantity());
            m.put("reserved", inv.getReservedQuantity());
            m.put("damaged", inv.getDamagedQuantity());
            m.put("status", inv.getStatus());
            m.put("minStock", inv.getProduct().getMinStock());
            return m;
        }).toList();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalItems", totalItems);
        summary.put("lowStockItems", lowStock);
        summary.put("totalAvailableQuantity", totalAvailable);
        summary.put("totalInventoryValue", totalValue != null ? totalValue : BigDecimal.ZERO);

        return Map.of("summary", summary, "items", items);
    }

    public Map<String, Object> getSupplierReport(LocalDate startDate, LocalDate endDate, Long supplierId) {
        List<Supplier> suppliers = supplierId != null
                ? supplierRepository.findById(supplierId).map(List::of).orElse(List.of())
                : supplierRepository.findAll();

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusYears(1);
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        List<Map<String, Object>> supplierData = suppliers.stream().map(s -> {
            List<PurchaseOrder> orders = orderRepository.findBySupplierId(s.getId()).stream()
                    .filter(o -> !o.getCreatedAt().isBefore(start) && !o.getCreatedAt().isAfter(end))
                    .toList();
            BigDecimal revenue = orders.stream()
                    .filter(o -> o.getStatus() == PurchaseOrder.OrderStatus.COMPLETED)
                    .map(PurchaseOrder::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("supplierId", s.getId());
            m.put("supplierName", s.getName());
            m.put("companyName", s.getCompanyName());
            m.put("totalOrders", orders.size());
            m.put("completedOrders", orders.stream().filter(o -> o.getStatus() == PurchaseOrder.OrderStatus.COMPLETED).count());
            m.put("totalRevenue", revenue);
            m.put("rating", s.getRating());
            return m;
        }).toList();

        long totalOrders = supplierData.stream().mapToLong(m -> (long)(int) m.get("totalOrders")).sum();
        Map<String, Object> summary = Map.of("totalSuppliers", suppliers.size(), "totalOrders", totalOrders);
        return Map.of("summary", summary, "suppliers", supplierData);
    }

    public Map<String, Object> getPurchaseReport(LocalDate startDate, LocalDate endDate, String status) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusYears(1);
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        List<PurchaseOrder> orders = orderRepository.findByCreatedAtBetween(start, end);
        if (status != null) {
            PurchaseOrder.OrderStatus os = PurchaseOrder.OrderStatus.valueOf(status);
            orders = orders.stream().filter(o -> o.getStatus() == os).toList();
        }

        BigDecimal totalAmount = orders.stream().map(PurchaseOrder::getTotalAmount)
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalOrders", orders.size());
        summary.put("totalAmount", totalAmount);
        summary.put("pendingOrders", orders.stream().filter(o -> o.getStatus() == PurchaseOrder.OrderStatus.PENDING).count());
        summary.put("completedOrders", orders.stream().filter(o -> o.getStatus() == PurchaseOrder.OrderStatus.COMPLETED).count());

        List<Map<String, Object>> orderList = orders.stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", o.getId());
            m.put("orderNumber", o.getOrderNumber());
            m.put("supplier", o.getSupplier() != null ? o.getSupplier().getName() : "");
            m.put("status", o.getStatus().name());
            m.put("totalAmount", o.getTotalAmount());
            m.put("createdAt", o.getCreatedAt());
            return m;
        }).toList();

        return Map.of("summary", summary, "orders", orderList);
    }

    public Map<String, Object> getProductReport(LocalDate startDate, LocalDate endDate, Long categoryId) {
        List<Product> products = productRepository.findAll();
        if (categoryId != null) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(categoryId))
                    .toList();
        }

        List<Map<String, Object>> productData = products.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("sku", p.getSku());
            m.put("category", p.getCategory() != null ? p.getCategory().getName() : "");
            m.put("price", p.getPrice());
            m.put("costPrice", p.getCostPrice());
            m.put("status", p.getStatus().name());
            return m;
        }).toList();

        Map<String, Object> summary = Map.of(
            "totalProducts", products.size(),
            "activeProducts", products.stream().filter(p -> p.getStatus() == Product.ProductStatus.ACTIVE).count()
        );
        return Map.of("summary", summary, "products", productData);
    }

    public Map<String, Object> getStockMovementReport(LocalDate startDate, LocalDate endDate, String type) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        List<StockMovement> movements;
        if (type != null) {
            movements = movementRepository.findByTypeAndDateRange(StockMovement.MovementType.valueOf(type), start, end);
        } else {
            movements = movementRepository.findByDateRange(start, end);
        }

        long totalIn = movements.stream().filter(m -> m.getType() == StockMovement.MovementType.STOCK_IN).count();
        long totalOut = movements.stream().filter(m -> m.getType() == StockMovement.MovementType.STOCK_OUT).count();

        Map<String, Object> summary = Map.of(
            "totalMovements", movements.size(),
            "totalStockIn", totalIn,
            "totalStockOut", totalOut
        );

        List<Map<String, Object>> movementList = movements.stream().map(sm -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", sm.getId());
            m.put("product", sm.getProduct() != null ? sm.getProduct().getName() : "");
            m.put("sku", sm.getProduct() != null ? sm.getProduct().getSku() : "");
            m.put("type", sm.getType().name());
            m.put("quantity", sm.getQuantity());
            m.put("reason", sm.getReason());
            m.put("status", sm.getStatus().name());
            m.put("performedBy", sm.getPerformedBy() != null ? sm.getPerformedBy().getName() : "");
            m.put("createdAt", sm.getCreatedAt());
            return m;
        }).toList();

        return Map.of("summary", summary, "movements", movementList);
    }

    public Map<String, Object> getLowStockReport() {
        List<Map<String, Object>> items = inventoryRepository.findLowStock().stream().map(inv -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("productId", inv.getProduct().getId());
            m.put("productName", inv.getProduct().getName());
            m.put("sku", inv.getProduct().getSku());
            m.put("category", inv.getProduct().getCategory() != null ? inv.getProduct().getCategory().getName() : "");
            m.put("available", inv.getAvailableQuantity());
            m.put("minStock", inv.getProduct().getMinStock());
            m.put("deficit", inv.getProduct().getMinStock() - inv.getAvailableQuantity());
            return m;
        }).toList();
        return Map.of("items", items, "count", items.size());
    }

    public Map<String, Object> getMonthlyReport(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1).minusSeconds(1);

        List<StockMovement> movements = movementRepository.findByDateRange(start, end);
        long totalStockIn = movements.stream()
                .filter(m -> m.getType() == StockMovement.MovementType.STOCK_IN
                          && m.getStatus() == StockMovement.MovementStatus.APPROVED)
                .mapToLong(StockMovement::getQuantity).sum();
        long totalStockOut = movements.stream()
                .filter(m -> m.getType() == StockMovement.MovementType.STOCK_OUT
                          && m.getStatus() == StockMovement.MovementStatus.APPROVED)
                .mapToLong(StockMovement::getQuantity).sum();

        List<PurchaseOrder> orders = orderRepository.findByCreatedAtBetween(start, end);
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == PurchaseOrder.OrderStatus.COMPLETED)
                .map(PurchaseOrder::getTotalAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Top products by movement quantity
        Map<String, Long> productMovements = movements.stream()
                .filter(m -> m.getProduct() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getProduct().getName(),
                        Collectors.summingLong(StockMovement::getQuantity)));
        List<Map<String, Object>> topProducts = productMovements.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> Map.<String, Object>of("name", e.getKey(), "quantity", e.getValue()))
                .toList();

        return Map.of(
            "month", month, "year", year,
            "totalStockIn", totalStockIn,
            "totalStockOut", totalStockOut,
            "totalOrders", orders.size(),
            "totalRevenue", totalRevenue,
            "topProducts", topProducts
        );
    }

    public byte[] downloadReport(String reportType, String format) {
        // Stub: In production, use Apache POI for Excel or iText/JasperReports for PDF
        String content = "Report: " + reportType + "\nFormat: " + format + "\nGenerated: " + LocalDateTime.now();
        return content.getBytes();
    }
}
