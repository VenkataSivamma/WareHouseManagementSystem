package com.warehouse.controller;

import com.warehouse.entity.User;
import com.warehouse.repository.UserRepository;
import com.warehouse.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAll(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer page,
            @RequestParam(defaultValue = "20") int size) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        if (page != null)
            return ResponseEntity.ok(notificationService.getForUserPaged(user.getId(), PageRequest.of(page, size)));
        return ResponseEntity.ok(notificationService.getForUser(user.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(notificationService.markRead(id, user.getId()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
