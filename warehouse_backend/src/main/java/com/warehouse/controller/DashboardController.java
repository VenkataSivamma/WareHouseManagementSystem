package com.warehouse.controller;

import com.warehouse.entity.User;
import com.warehouse.repository.UserRepository;
import com.warehouse.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    // ─── ADMIN ───────────────────────────────────────────────────────────────

    @GetMapping("/admin/stats")
    public ResponseEntity<List<Map<String, Object>>> adminStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/admin/charts")
    public ResponseEntity<Map<String, Object>> adminCharts() {
        return ResponseEntity.ok(dashboardService.getAdminCharts());
    }

    @GetMapping("/admin/activities")
    public ResponseEntity<Map<String, Object>> adminActivities() {
        return ResponseEntity.ok(dashboardService.getAdminActivities());
    }

    @GetMapping("/admin/notifications")
    public ResponseEntity<List<Map<String, Object>>> adminNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(dashboardService.getAdminNotifications(user.getId()));
    }

    // ─── MANAGER ─────────────────────────────────────────────────────────────

    @GetMapping("/manager/stats")
    public ResponseEntity<List<Map<String, Object>>> managerStats() {
        return ResponseEntity.ok(dashboardService.getManagerStats());
    }

    @GetMapping("/manager/charts")
    public ResponseEntity<Map<String, Object>> managerCharts() {
        return ResponseEntity.ok(dashboardService.getManagerCharts());
    }

    @GetMapping("/manager/activities")
    public ResponseEntity<Map<String, Object>> managerActivities() {
        return ResponseEntity.ok(dashboardService.getManagerActivities());
    }

    // ─── STAFF ────────────────────────────────────────────────────────────

    @GetMapping("/staff/stats")
    public ResponseEntity<List<Map<String, Object>>> staffStats() {
        return ResponseEntity.ok(dashboardService.getStaffStats());
    }

    @GetMapping("/staff/tasks")
    public ResponseEntity<Map<String, Object>> staffTasks() {
        return ResponseEntity.ok(dashboardService.getStaffTasks());
    }

    // ─── SUPPLIER ────────────────────────────────────────────────────────────

    @GetMapping("/supplier/stats")
    public ResponseEntity<List<Map<String, Object>>> supplierStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(dashboardService.getSupplierStats(user.getId()));
    }

    @GetMapping("/supplier/orders")
    public ResponseEntity<Map<String, Object>> supplierOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(dashboardService.getSupplierOrders(user.getId()));
    }
}
