package com.warehouse.controller;

import com.warehouse.dto.UserDTO;
import com.warehouse.entity.User;
import com.warehouse.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<Page<UserDTO.Response>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(staffService.getAll(search, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserDTO.Response> create(@Valid @RequestBody UserDTO.CreateRequest req) {
        return ResponseEntity.status(201).body(staffService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO.Response> update(@PathVariable Long id,
                                                    @RequestBody UserDTO.UpdateRequest req) {
        return ResponseEntity.ok(staffService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        staffService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserDTO.Response> activate(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.setStatus(id, User.UserStatus.ACTIVE));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserDTO.Response> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.setStatus(id, User.UserStatus.INACTIVE));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO.Response>> search(@RequestParam String q) {
        return ResponseEntity.ok(staffService.search(q));
    }
}
