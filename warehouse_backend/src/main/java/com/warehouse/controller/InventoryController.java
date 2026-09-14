package com.warehouse.controller;

import com.warehouse.dto.InventoryDTO;
import com.warehouse.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Page<InventoryDTO.Response>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getAll(search, categoryId, status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryDTO.Response> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    @GetMapping("/available")
    public ResponseEntity<Page<InventoryDTO.Response>> getAvailable(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getAvailable(search, PageRequest.of(page, size)));
    }

    @GetMapping("/reserved")
    public ResponseEntity<List<InventoryDTO.Response>> getReserved() {
        return ResponseEntity.ok(inventoryService.getReserved());
    }

    @GetMapping("/damaged")
    public ResponseEntity<List<InventoryDTO.Response>> getDamaged() {
        return ResponseEntity.ok(inventoryService.getDamaged());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryDTO.Response>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStock());
    }

    @GetMapping("/movements")
    public ResponseEntity<Page<InventoryDTO.StockMovementResponse>> getMovements(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getMovements(type, productId, PageRequest.of(page, size)));
    }

    @GetMapping("/history/{productId}")
    public ResponseEntity<?> getHistory(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        if (page != null)
            return ResponseEntity.ok(inventoryService.getHistoryPaged(productId, PageRequest.of(page, size)));
        return ResponseEntity.ok(inventoryService.getHistory(productId));
    }

    @PostMapping("/stock-in")
    public ResponseEntity<InventoryDTO.StockMovementResponse> stockIn(
            @Valid @RequestBody InventoryDTO.StockRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(inventoryService.stockIn(req, userDetails.getUsername()));
    }

    @PostMapping("/stock-out")
    public ResponseEntity<InventoryDTO.StockMovementResponse> stockOut(
            @Valid @RequestBody InventoryDTO.StockRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(inventoryService.stockOut(req, userDetails.getUsername()));
    }

    @PatchMapping("/stock-in/{id}/approve")
    public ResponseEntity<InventoryDTO.StockMovementResponse> approveStockIn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(inventoryService.approveStockIn(id, userDetails.getUsername()));
    }

    @PatchMapping("/stock-out/{id}/approve")
    public ResponseEntity<InventoryDTO.StockMovementResponse> approveStockOut(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(inventoryService.approveStockOut(id, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<InventoryDTO.StockMovementResponse> reject(
            @PathVariable Long id,
            @RequestBody InventoryDTO.RejectRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(inventoryService.reject(id, req.getReason(), userDetails.getUsername()));
    }
}
