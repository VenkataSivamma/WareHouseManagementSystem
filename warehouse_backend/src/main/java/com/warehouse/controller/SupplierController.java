package com.warehouse.controller;

import com.warehouse.dto.SupplierDTO;
import com.warehouse.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<Page<SupplierDTO.Response>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(supplierService.getAll(search, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    @PostMapping
    public ResponseEntity<SupplierDTO.Response> create(@Valid @RequestBody SupplierDTO.CreateRequest req) {
        return ResponseEntity.status(201).body(supplierService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDTO.Response> update(@PathVariable Long id,
                                                        @RequestBody SupplierDTO.UpdateRequest req) {
        return ResponseEntity.ok(supplierService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<SupplierDTO.Response> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.toggleStatus(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SupplierDTO.Response>> search(@RequestParam String q) {
        return ResponseEntity.ok(supplierService.search(q));
    }

    @GetMapping("/profile")
    public ResponseEntity<SupplierDTO.Response> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(supplierService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SupplierDTO.Response> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SupplierDTO.UpdateRequest req) {
        return ResponseEntity.ok(supplierService.updateProfile(userDetails.getUsername(), req));
    }
}
