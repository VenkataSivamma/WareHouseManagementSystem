package com.warehouse.controller;

import com.warehouse.dto.CategoryDTO;
import com.warehouse.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<CategoryDTO.Response>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sort) {
        return ResponseEntity.ok(categoryService.getAll(PageRequest.of(page, size, Sort.by(sort))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CategoryDTO.Response> create(@Valid @RequestBody CategoryDTO.Request req) {
        return ResponseEntity.status(201).body(categoryService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO.Response> update(@PathVariable Long id,
                                                        @Valid @RequestBody CategoryDTO.Request req) {
        return ResponseEntity.ok(categoryService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<CategoryDTO.Response> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.toggleStatus(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CategoryDTO.Response>> search(@RequestParam String q) {
        return ResponseEntity.ok(categoryService.search(q));
    }
}
