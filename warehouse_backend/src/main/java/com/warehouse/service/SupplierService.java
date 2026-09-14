package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.SupplierDTO;
import com.warehouse.entity.*;
import com.warehouse.exception.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper mapper;

    public Page<SupplierDTO.Response> getAll(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return supplierRepository
                    .findByNameContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(search, search, pageable)
                    .map(mapper::toSupplierDTO);
        }
        return supplierRepository.findAll(pageable).map(mapper::toSupplierDTO);
    }

    public SupplierDTO.Response getById(Long id) {
        return mapper.toSupplierDTO(findById(id));
    }

    @Transactional
    public SupplierDTO.Response create(SupplierDTO.CreateRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already in use");
        Supplier s = new Supplier();
        s.setName(req.getName());
        s.setEmail(req.getEmail());
        s.setPassword(passwordEncoder.encode(req.getPassword()));
        s.setPhone(req.getPhone());
        s.setRole(User.Role.SUPPLIER);
        s.setStatus(User.UserStatus.ACTIVE);
        s.setCompanyName(req.getCompanyName());
        s.setAddress(req.resolvedAddress());
        s.setContactPerson(req.getContactPerson());
        s.setTaxId(req.resolvedTaxId());
        s.setRating(0.0);
        s.setTotalOrders(0);
        supplierRepository.save(s);
        return mapper.toSupplierDTO(s);
    }

    @Transactional
    public SupplierDTO.Response update(Long id, SupplierDTO.UpdateRequest req) {
        Supplier s = findById(id);
        if (req.getName() != null) s.setName(req.getName());
        if (req.getPhone() != null) s.setPhone(req.getPhone());
        if (req.getCompanyName() != null) s.setCompanyName(req.getCompanyName());
        String addr = req.resolvedAddress();
        if (addr != null) s.setAddress(addr);
        if (req.getContactPerson() != null) s.setContactPerson(req.getContactPerson());
        String taxId = req.resolvedTaxId();
        if (taxId != null) s.setTaxId(taxId);
        if (req.getBankAccount() != null) s.setBankAccount(req.getBankAccount());
        supplierRepository.save(s);
        return mapper.toSupplierDTO(s);
    }

    @Transactional
    public void delete(Long id) {
        supplierRepository.delete(findById(id));
    }

    @Transactional
    public SupplierDTO.Response toggleStatus(Long id) {
        Supplier s = findById(id);
        s.setStatus(s.getStatus() == User.UserStatus.ACTIVE ? User.UserStatus.INACTIVE : User.UserStatus.ACTIVE);
        supplierRepository.save(s);
        return mapper.toSupplierDTO(s);
    }

    public List<SupplierDTO.Response> search(String q) {
        return supplierRepository.findByNameContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(q, q)
                .stream().map(mapper::toSupplierDTO).toList();
    }

    public SupplierDTO.Response getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!(user instanceof Supplier s)) throw new UnauthorizedException("Not a supplier");
        return mapper.toSupplierDTO(s);
    }

    @Transactional
    public SupplierDTO.Response updateProfile(String email, SupplierDTO.UpdateRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!(user instanceof Supplier s)) throw new UnauthorizedException("Not a supplier");
        if (req.getName() != null) s.setName(req.getName());
        if (req.getPhone() != null) s.setPhone(req.getPhone());
        if (req.getCompanyName() != null) s.setCompanyName(req.getCompanyName());
        String addr = req.resolvedAddress();
        if (addr != null) s.setAddress(addr);
        if (req.getContactPerson() != null) s.setContactPerson(req.getContactPerson());
        String taxId = req.resolvedTaxId();
        if (taxId != null) s.setTaxId(taxId);
        if (req.getBankAccount() != null) s.setBankAccount(req.getBankAccount());
        supplierRepository.save(s);
        return mapper.toSupplierDTO(s);
    }

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
    }
}
