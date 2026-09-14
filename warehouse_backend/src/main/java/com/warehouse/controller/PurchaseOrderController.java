package com.warehouse.controller;

import com.warehouse.dto.PurchaseOrderDTO;
import com.warehouse.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderDTO.Response>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(purchaseOrderService.getAll(status, supplierId, search, PageRequest.of(page, size)));
    }

    @GetMapping("/supplier")
    public ResponseEntity<List<PurchaseOrderDTO.Response>> getForSupplier(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.getForSupplier(userDetails.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PurchaseOrderDTO.Response>> search(@RequestParam String q) {
        return ResponseEntity.ok(purchaseOrderService.search(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getById(id));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<PurchaseOrderDTO.TimelineResponse>> getTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getTimeline(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderDTO.Response> create(
            @Valid @RequestBody PurchaseOrderDTO.CreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(purchaseOrderService.create(req, userDetails.getUsername()));
    }

    // Simplified endpoint for manager frontend: { supplierId, productId, quantity, estimatedCost, notes }
    @PostMapping("/simple")
    public ResponseEntity<PurchaseOrderDTO.Response> createSimple(
            @RequestBody PurchaseOrderDTO.SimpleCreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(purchaseOrderService.createSimple(req, userDetails.getUsername()));
    }

    @PutMapping("/{id}/simple")
    public ResponseEntity<PurchaseOrderDTO.Response> updateSimple(
            @PathVariable Long id,
            @RequestBody PurchaseOrderDTO.SimpleCreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.updateSimple(id, req, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderDTO.CreateRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.update(id, req, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        purchaseOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<PurchaseOrderDTO.Response> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.approve(id, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<PurchaseOrderDTO.Response> reject(
            @PathVariable Long id,
            @RequestBody PurchaseOrderDTO.RejectRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.reject(id, req.getReason(), userDetails.getUsername()));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<PurchaseOrderDTO.Response> complete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.complete(id, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderDTO.Response> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.cancel(id, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/assign-supplier")
    public ResponseEntity<PurchaseOrderDTO.Response> assignSupplier(
            @PathVariable Long id,
            @RequestBody PurchaseOrderDTO.AssignSupplierRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.assignSupplier(id, req.getSupplierId(), userDetails.getUsername()));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<PurchaseOrderDTO.Response> accept(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseOrderService.accept(id, userDetails.getUsername()));
    }
}
