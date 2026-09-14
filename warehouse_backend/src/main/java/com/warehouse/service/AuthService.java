package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.AuthDTO;
import com.warehouse.entity.*;
import com.warehouse.exception.*;
import com.warehouse.repository.*;
import com.warehouse.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final JavaMailSender mailSender;

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EntityMapper mapper;

    public AuthDTO.AuthResponse login(String email, String password, User.Role expectedRole) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new UnauthorizedException("Invalid credentials");
        if (user.getRole() != expectedRole)
            throw new UnauthorizedException("Access denied for this login endpoint");
        if (user.getStatus() == User.UserStatus.INACTIVE)
            throw new UnauthorizedException("Account is inactive");

        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setUser(mapper.toUserResponse(user));
        response.setToken(jwtUtil.generateToken(user));
        return response;
    }

    // Staff login: identifier can be email OR employeeId
    public AuthDTO.AuthResponse staffLogin(String identifier, String password) {
        User user;
        if (identifier != null && identifier.contains("@")) {
            user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        } else {
            user = userRepository.findByEmployeeId(identifier)
                    .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        }
        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new UnauthorizedException("Invalid credentials");
        if (user.getRole() != User.Role.STAFF)
            throw new UnauthorizedException("Access denied for this login endpoint");
        if (user.getStatus() == User.UserStatus.INACTIVE)
            throw new UnauthorizedException("Account is inactive");

        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setUser(mapper.toUserResponse(user));
        response.setToken(jwtUtil.generateToken(user));
        return response;
    }

    @Transactional
    public AuthDTO.AuthResponse registerManager(AuthDTO.RegisterManagerRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already in use");
        User user = User.builder()
                .name(req.getName()).email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone()).role(User.Role.MANAGER)
                .employeeId(req.getEmployeeId()).department(req.getDepartment())
                .warehouseLocation(req.getWarehouseLocation())
                .status(User.UserStatus.ACTIVE).build();
        userRepository.save(user);
        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setUser(mapper.toUserResponse(user));
        return response;
    }

    @Transactional
    public AuthDTO.AuthResponse registerSupplier(AuthDTO.RegisterSupplierRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already in use");
        Supplier supplier = new Supplier();
        supplier.setName(req.getName());
        supplier.setEmail(req.getEmail());
        supplier.setPassword(passwordEncoder.encode(req.getPassword()));
        supplier.setPhone(req.getPhone());
        supplier.setRole(User.Role.SUPPLIER);
        supplier.setStatus(User.UserStatus.ACTIVE);
        supplier.setCompanyName(req.getCompanyName());
        supplier.setAddress(req.getAddress());
        supplier.setContactPerson(req.getContactPerson());
        supplier.setTaxId(req.getTaxId());
        supplier.setRating(0.0);
        supplier.setTotalOrders(0);
        supplierRepository.save(supplier);
        AuthDTO.AuthResponse response = new AuthDTO.AuthResponse();
        response.setUser(mapper.toUserResponse(supplier));
        return response;
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public AuthDTO.UserResponse updateProfile(String email, AuthDTO.UpdateProfileRequest req) {
        User user = getCurrentUser(email);
        String resolvedName = req.resolvedName();
        if (resolvedName != null) user.setName(resolvedName);
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getWarehouseLocation() != null) user.setWarehouseLocation(req.getWarehouseLocation());
        if (user instanceof Supplier s) {
            if (req.getCompanyName() != null) s.setCompanyName(req.getCompanyName());
            if (req.getAddress() != null) s.setAddress(req.getAddress());
            if (req.getContactPerson() != null) s.setContactPerson(req.getContactPerson());
            if (req.getBankAccount() != null) s.setBankAccount(req.getBankAccount());
        }
        userRepository.save(user);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void changePassword(String email, AuthDTO.ChangePasswordRequest req) {
        User user = getCurrentUser(email);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
            throw new IllegalArgumentException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with that email"));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("Password Reset Request");
        msg.setText("Hi " + user.getName() + ",\n\nClick the link below to reset your password (valid for 1 hour):\n"
                + frontendUrl + "/reset-password?token=" + token
                + "\n\nIf you did not request this, ignore this email.");
        mailSender.send(msg);
    }

    public AuthDTO.UserResponse toUserResponse(User user) {
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Reset token has expired");
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}
