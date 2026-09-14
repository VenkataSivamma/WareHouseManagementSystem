package com.warehouse.service;

import com.warehouse.entity.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository movementRepository;
    private final PurchaseOrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;
    private final SupplierRepository supplierRepository;
    private final NotificationRepository notificationRepository;

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getAdminStats() {
        long totalProducts = productRepository.count();
        long newThisMonth = productRepository.countCreatedSince(LocalDateTime.now().withDayOfMonth(1).withHour(0));
        long totalCategories = categoryRepository.count();
        long activeSuppliers = supplierRepository.countByStatus(User.UserStatus.ACTIVE);
        long totalManagers = userRepository.countByRole(User.Role.MANAGER);
        long totalStaff = userRepository.countByRole(User.Role.STAFF);
        long totalOrders = orderRepository.count();
        Long availableStock = inventoryRepository.sumAvailableQuantity();
        long lowStockItems = inventoryRepository.findLowStock().size();
        BigDecimal monthlyRevenue = orderRepository.sumRevenueCompletedSince(
                LocalDateTime.now().withDayOfMonth(1).withHour(0));
        long pendingApprovals = movementRepository.countPending();

        return List.of(
            stat("Total Products", totalProducts, "📦", "primary", "+"+newThisMonth+" this month"),
            stat("Total Categories", totalCategories, "🏷️", "info", null),
            stat("Active Suppliers", activeSuppliers, "🏢", "success", null),
            stat("Total Managers", totalManagers, "👔", "warning", null),
            stat("Total Staff", totalStaff, "👷", "secondary", null),
            stat("Purchase Orders", totalOrders, "🛒", "primary", null),
            stat("Available Stock", availableStock != null ? availableStock : 0, "✅", "success", null),
            stat("Low Stock Items", lowStockItems, "⚠️", "danger", null),
            stat("Monthly Revenue", formatCurrency(monthlyRevenue), "💰", "success", null),
            stat("Pending Approvals", pendingApprovals, "⏳", "warning", null)
        );
    }

    public Map<String, Object> getAdminCharts() {
        return Map.of(
            "stockMovement", getMonthlyMovements(),
            "categoryDistribution", getCategoryDistribution()
        );
    }

    public Map<String, Object> getAdminActivities() {
        List<StockMovement> recent = movementRepository.findRecentMovements(PageRequest.of(0, 10));
        List<Map<String, Object>> activities = recent.stream().map(sm -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("id", sm.getId());
            a.put("type", sm.getType().name());
            a.put("message", sm.getType().name() + " of " + sm.getQuantity()
                    + " units for " + (sm.getProduct() != null ? sm.getProduct().getName() : ""));
            a.put("time", sm.getCreatedAt());
            a.put("icon", sm.getType() == StockMovement.MovementType.STOCK_IN ? "📥" : "📤");
            return a;
        }).toList();

        List<Map<String, Object>> lowStock = inventoryRepository.findLowStock().stream().map(inv -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", inv.getProduct().getName());
            item.put("sku", inv.getProduct().getSku());
            item.put("category", inv.getProduct().getCategory() != null ? inv.getProduct().getCategory().getName() : "");
            item.put("available", inv.getAvailableQuantity());
            item.put("minStock", inv.getProduct().getMinStock());
            return item;
        }).toList();

        return Map.of("activities", activities, "lowStockItems", lowStock);
    }

    public List<Map<String, Object>> getAdminNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(n -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", n.getId());
                    m.put("title", n.getTitle());
                    m.put("message", n.getMessage());
                    m.put("type", n.getType());
                    m.put("isRead", n.getIsRead());
                    m.put("createdAt", n.getCreatedAt());
                    return m;
                }).toList();
    }

    // ─── MANAGER ─────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getManagerStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long pendingApprovals = movementRepository.countPending();
        long stockInToday = movementRepository.countByTypeAndCreatedAtAfter(StockMovement.MovementType.STOCK_IN, todayStart);
        long stockOutToday = movementRepository.countByTypeAndCreatedAtAfter(StockMovement.MovementType.STOCK_OUT, todayStart);
        long lowStockItems = inventoryRepository.findLowStock().size();
        long purchaseRequests = orderRepository.countByStatus(PurchaseOrder.OrderStatus.PENDING);
        BigDecimal inventoryValue = inventoryRepository.sumInventoryValue();

        return List.of(
            stat("Pending Approvals", pendingApprovals, "⏳", "warning", null),
            stat("Stock In Today", stockInToday, "📥", "success", null),
            stat("Stock Out Today", stockOutToday, "📤", "info", null),
            stat("Low Stock Items", lowStockItems, "⚠️", "danger", null),
            stat("Purchase Requests", purchaseRequests, "🛒", "primary", null),
            stat("Total Inventory Value", formatCurrency(inventoryValue), "💰", "success", null)
        );
    }

    public Map<String, Object> getManagerCharts() {
        return Map.of(
            "stockMovement", getMonthlyMovements(),
            "categoryDistribution", getCategoryDistribution()
        );
    }

    public Map<String, Object> getManagerActivities() {
        List<StockMovement> recent = movementRepository.findRecentMovements(PageRequest.of(0, 10));
        List<Map<String, Object>> activities = recent.stream().map(sm -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("id", sm.getId());
            a.put("type", sm.getType().name());
            a.put("message", sm.getType().name() + " - " + sm.getQuantity() + " units");
            a.put("time", sm.getCreatedAt());
            a.put("icon", sm.getType() == StockMovement.MovementType.STOCK_IN ? "📥" : "📤");
            return a;
        }).toList();

        List<Map<String, Object>> pending = movementRepository
                .findWithFilters(null, null, PageRequest.of(0, 10))
                .stream()
                .filter(sm -> sm.getStatus() == StockMovement.MovementStatus.PENDING)
                .map(sm -> {
                    Map<String, Object> p = new LinkedHashMap<>();
                    p.put("id", sm.getId());
                    p.put("type", sm.getType().name());
                    p.put("product", sm.getProduct() != null ? sm.getProduct().getName() : "");
                    p.put("quantity", sm.getQuantity());
                    p.put("requestedBy", sm.getPerformedBy() != null ? sm.getPerformedBy().getName() : "");
                    p.put("date", sm.getCreatedAt());
                    return p;
                }).toList();

        return Map.of("activities", activities, "pendingApprovals", pending);
    }

    // ─── STAFF ───────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getStaffStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long stockInToday = movementRepository.countByTypeAndCreatedAtAfter(StockMovement.MovementType.STOCK_IN, todayStart);
        long stockOutToday = movementRepository.countByTypeAndCreatedAtAfter(StockMovement.MovementType.STOCK_OUT, todayStart);
        long lowStockAlerts = inventoryRepository.findLowStock().size();

        return List.of(
            stat("Stock In Today", stockInToday, "📥", "success", null),
            stat("Stock Out Today", stockOutToday, "📤", "info", null),
            stat("My Tasks Today", stockInToday + stockOutToday, "📋", "primary", null),
            stat("Low Stock Alerts", lowStockAlerts, "⚠️", "danger", null)
        );
    }

    public Map<String, Object> getStaffTasks() {
        List<Map<String, Object>> tasks = inventoryRepository.findLowStock().stream().limit(10).map(inv -> {
            Map<String, Object> task = new LinkedHashMap<>();
            task.put("id", inv.getId());
            task.put("task", "Restock: " + inv.getProduct().getName());
            task.put("time", "ASAP");
            task.put("priority", "high");
            task.put("status", "pending");
            return task;
        }).toList();

        List<StockMovement> recent = movementRepository.findRecentMovements(PageRequest.of(0, 5));
        List<Map<String, Object>> activities = recent.stream().map(sm -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("id", sm.getId());
            a.put("type", sm.getType().name());
            a.put("message", (sm.getType() == StockMovement.MovementType.STOCK_IN ? "Stock In" : "Stock Out")
                    + " - " + sm.getQuantity() + " units"
                    + (sm.getProduct() != null ? " of " + sm.getProduct().getName() : ""));
            a.put("time", sm.getCreatedAt());
            a.put("icon", sm.getType() == StockMovement.MovementType.STOCK_IN ? "📥" : "📤");
            return a;
        }).toList();

        return Map.of("tasks", tasks, "activities", activities);
    }

    // ─── SUPPLIER ────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getSupplierStats(Long supplierId) {
        long totalOrders = deliveryRepository.countBySupplierId(supplierId);
        long pendingOrders = orderRepository.findBySupplierId(supplierId).stream()
                .filter(o -> o.getStatus() == PurchaseOrder.OrderStatus.PENDING
                          || o.getStatus() == PurchaseOrder.OrderStatus.APPROVED).count();
        long completedDeliveries = deliveryRepository.countBySupplierIdAndStatus(supplierId, Delivery.DeliveryStatus.DELIVERED);
        BigDecimal revenue = orderRepository.sumRevenueBySupplier(supplierId);

        return List.of(
            stat("Total Orders", totalOrders, "🛒", "primary", null),
            stat("Pending Orders", pendingOrders, "⏳", "warning", null),
            stat("Completed Deliveries", completedDeliveries, "✅", "success", null),
            stat("Total Revenue", formatCurrency(revenue), "💰", "success", null)
        );
    }

    public Map<String, Object> getSupplierOrders(Long supplierId) {
        List<Map<String, Object>> recentOrders = orderRepository.findBySupplierId(supplierId)
                .stream().limit(5).map(o -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", o.getId());
                    m.put("orderNumber", o.getOrderNumber());
                    m.put("status", o.getStatus().name());
                    m.put("totalAmount", o.getTotalAmount());
                    m.put("createdAt", o.getCreatedAt());
                    return m;
                }).toList();

        List<Map<String, Object>> activities = deliveryRepository.findBySupplierId(supplierId)
                .stream().limit(5).map(d -> {
                    Map<String, Object> a = new LinkedHashMap<>();
                    a.put("id", d.getId());
                    a.put("type", "DELIVERY");
                    a.put("message", "Delivery " + d.getDeliveryNumber() + " - " + d.getStatus().name());
                    a.put("time", d.getUpdatedAt());
                    return a;
                }).toList();

        return Map.of("orders", recentOrders, "activities", activities);
    }

    // ─── Shared helpers ───────────────────────────────────────────────────────

    private List<Map<String, Object>> getMonthlyMovements() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Object[]> rows = movementRepository.getMonthlyMovements(sixMonthsAgo);
        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", row[0]);
            m.put("stockIn", row[1] != null ? row[1] : 0);
            m.put("stockOut", row[2] != null ? row[2] : 0);
            return m;
        }).toList();
    }

    private List<Map<String, Object>> getCategoryDistribution() {
        return categoryRepository.findAll().stream().map(cat -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", cat.getName());
            m.put("value", productRepository.findByCategory(cat).size());
            return m;
        }).toList();
    }

    private Map<String, Object> stat(String title, Object value, String icon, String variant, String change) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("title", title);
        m.put("value", value);
        m.put("icon", icon);
        m.put("variant", variant);
        if (change != null) m.put("change", change);
        return m;
    }

    private String formatCurrency(BigDecimal value) {
        if (value == null) return "₹0";
        return "₹" + String.format("%,.0f", value);
    }
}
