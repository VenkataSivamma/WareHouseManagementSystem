package com.warehouse.config;

import com.warehouse.entity.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    @Value("${app.seed-admin:false}")
    private boolean seedAdmin;
    @Value("${app.seed-admin-email:}")
    private String adminEmail;
    @Value("${app.seed-admin-password:}")
    private String adminPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedAdmin) {
            log.info("Admin seeding is disabled.");
            return;
        }
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            throw new IllegalStateException("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required when admin seeding is enabled");
        }
        if (userRepository.countByRole(User.Role.ADMIN) > 0) {
            log.info("Admin already exists, skipping seed.");
            return;
        }
        log.info("Creating default admin account...");
        User admin = new User();
        admin.setName("System Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setPhone("9000000001");
        admin.setRole(User.Role.ADMIN);
        admin.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(admin);
        log.info("Default admin account created for configured email.");
    }
}
