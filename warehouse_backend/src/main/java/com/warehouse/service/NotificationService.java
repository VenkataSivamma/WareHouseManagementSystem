package com.warehouse.service;

import com.warehouse.entity.*;
import com.warehouse.exception.ResourceNotFoundException;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toMap).toList();
    }

    public Page<Map<String, Object>> getForUserPaged(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toMap);
    }

    @Transactional
    public Map<String, Object> markRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getUser().getId().equals(userId))
            throw new ResourceNotFoundException("Notification not found");
        n.setIsRead(true);
        notificationRepository.save(n);
        return toMap(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    @Transactional
    public void createNotification(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        Notification n = Notification.builder()
                .user(user).title(title).message(message).type(type).isRead(false).build();
        notificationRepository.save(n);
    }

    private Map<String, Object> toMap(Notification n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("title", n.getTitle());
        m.put("message", n.getMessage());
        m.put("type", n.getType());
        m.put("isRead", n.getIsRead());
        m.put("createdAt", n.getCreatedAt());
        return m;
    }
}
