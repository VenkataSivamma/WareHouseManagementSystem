package com.warehouse.controller;

import com.warehouse.dto.ProductDTO;
import com.warehouse.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDTO.Response>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.getAll(search, categoryId, status, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductDTO.Response> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.getBySku(sku));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductDTO.Response> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(productService.getByBarcode(barcode));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDTO.Response>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getByCategory(categoryId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductDTO.Response>> getLowStock() {
        return ResponseEntity.ok(productService.getLowStock());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO.Response>> search(@RequestParam String q) {
        return ResponseEntity.ok(productService.search(q));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ProductDTO.Response> create(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam String sku,
            @RequestParam(required = false) String barcode,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) BigDecimal costPrice,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) MultipartFile image) {
        return ResponseEntity.status(201).body(
                productService.create(name, description, sku, barcode, price, costPrice,
                        minStock, maxStock, categoryId, supplierId, quantity, image));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ProductDTO.Response> update(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String barcode,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) BigDecimal costPrice,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) MultipartFile image) {
        return ResponseEntity.ok(
                productService.update(id, name, description, sku, barcode, price, costPrice,
                        minStock, maxStock, categoryId, supplierId, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ProductDTO.Response> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleStatus(id));
    }
}
