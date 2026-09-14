package com.warehouse.controller;

import com.warehouse.dto.DeliveryDTO;
import com.warehouse.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    public ResponseEntity<Page<DeliveryDTO.Response>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(deliveryService.getAll(status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.getById(id));
    }

    @GetMapping("/supplier")
    public ResponseEntity<List<DeliveryDTO.Response>> getForSupplier(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.getForSupplier(userDetails.getUsername()));
    }

    @GetMapping("/history")
    public ResponseEntity<Page<DeliveryDTO.Response>> getHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(deliveryService.getHistory(startDate, endDate, PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeliveryDTO.Response> updateStatus(
            @PathVariable Long id,
            @RequestBody DeliveryDTO.StatusRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.updateStatus(id, req.getStatus(), userDetails.getUsername()));
    }

    @PatchMapping("/{id}/delivered")
    public ResponseEntity<DeliveryDTO.Response> markDelivered(
            @PathVariable Long id,
            @RequestBody DeliveryDTO.DeliveredRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.markDelivered(id, req, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<DeliveryDTO.Response> updateNotes(
            @PathVariable Long id,
            @RequestBody DeliveryDTO.NotesRequest req) {
        return ResponseEntity.ok(deliveryService.updateNotes(id, req.getNotes()));
    }

    @PostMapping(value = "/{id}/proof", consumes = "multipart/form-data")
    public ResponseEntity<DeliveryDTO.Response> uploadProof(
            @PathVariable Long id,
            @RequestParam MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(deliveryService.uploadProof(id, file, userDetails.getUsername()));
    }
}
