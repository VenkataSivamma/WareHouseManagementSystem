package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.UserDTO;
import com.warehouse.entity.User;
import com.warehouse.exception.*;
import com.warehouse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagerService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper mapper;

    public Page<UserDTO.Response> getAll(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return userRepository.findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                    User.Role.MANAGER, search, User.Role.MANAGER, search, pageable).map(mapper::toUserDTO);
        }
        return userRepository.findByRole(User.Role.MANAGER, pageable).map(mapper::toUserDTO);
    }

    public UserDTO.Response getById(Long id) {
        return mapper.toUserDTO(findById(id));
    }

    @Transactional
    public UserDTO.Response create(UserDTO.CreateRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already in use");
        User user = User.builder().name(req.resolvedName()).email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .employeeId(req.getEmployeeId())
                .department(req.getDepartment())
                .warehouseLocation(req.getWarehouseLocation())
                .role(User.Role.MANAGER).status(User.UserStatus.ACTIVE).build();
        userRepository.save(user);
        return mapper.toUserDTO(user);
    }

    @Transactional
    public UserDTO.Response update(Long id, UserDTO.UpdateRequest req) {
        User user = findById(id);
        String resolvedName = req.resolvedName();
        if (resolvedName != null) user.setName(resolvedName);
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getEmployeeId() != null) user.setEmployeeId(req.getEmployeeId());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getWarehouseLocation() != null) user.setWarehouseLocation(req.getWarehouseLocation());
        userRepository.save(user);
        return mapper.toUserDTO(user);
    }

    @Transactional
    public void delete(Long id) {
        userRepository.delete(findById(id));
    }

    @Transactional
    public UserDTO.Response setStatus(Long id, User.UserStatus status) {
        User user = findById(id);
        user.setStatus(status);
        userRepository.save(user);
        return mapper.toUserDTO(user);
    }

    public List<UserDTO.Response> search(String q) {
        return userRepository.findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                User.Role.MANAGER, q, User.Role.MANAGER, q).stream().map(mapper::toUserDTO).toList();
    }

    private User findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found: " + id));
        if (user.getRole() != User.Role.MANAGER)
            throw new ResourceNotFoundException("Manager not found: " + id);
        return user;
    }
}
