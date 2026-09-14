package com.warehouse.controller;

import com.warehouse.dto.UserDTO;
import com.warehouse.entity.User;
import com.warehouse.service.ManagerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/managers")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;

    @GetMapping
    public ResponseEntity<Page<UserDTO.Response>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(managerService.getAll(search, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserDTO.Response> create(@Valid @RequestBody UserDTO.CreateRequest req) {
        return ResponseEntity.status(201).body(managerService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO.Response> update(@PathVariable Long id,
                                                    @RequestBody UserDTO.UpdateRequest req) {
        return ResponseEntity.ok(managerService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        managerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserDTO.Response> activate(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.setStatus(id, User.UserStatus.ACTIVE));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserDTO.Response> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.setStatus(id, User.UserStatus.INACTIVE));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO.Response>> search(@RequestParam String q) {
        return ResponseEntity.ok(managerService.search(q));
    }
}
