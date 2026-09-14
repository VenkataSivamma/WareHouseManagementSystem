package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.DeliveryDTO;
import com.warehouse.entity.*;
import com.warehouse.exception.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Page<DeliveryDTO.Response> getAll(String status, Pageable pageable) {
        Delivery.DeliveryStatus ds = status != null ? Delivery.DeliveryStatus.valueOf(status) : null;
        return deliveryRepository.findWithStatus(ds, pageable).map(mapper::toDeliveryDTO);
    }

    public DeliveryDTO.Response getById(Long id) {
        return mapper.toDeliveryDTO(findById(id));
    }

    @Transactional
    public DeliveryDTO.Response updateStatus(Long id, String status, String userEmail) {
        Delivery delivery = findById(id);
        validateSupplierAccess(delivery, userEmail);
        delivery.setStatus(Delivery.DeliveryStatus.valueOf(status));
        deliveryRepository.save(delivery);
        return mapper.toDeliveryDTO(delivery);
    }

    @Transactional
    public DeliveryDTO.Response markDelivered(Long id, DeliveryDTO.DeliveredRequest req, String userEmail) {
        Delivery delivery = findById(id);
        validateSupplierAccess(delivery, userEmail);
        delivery.setStatus(Delivery.DeliveryStatus.DELIVERED);
        delivery.setDeliveredDate(req.getDeliveredDate() != null ? req.getDeliveredDate() : LocalDate.now());
        if (req.getNotes() != null) delivery.setNotes(req.getNotes());
        deliveryRepository.save(delivery);
        return mapper.toDeliveryDTO(delivery);
    }

    @Transactional
    public DeliveryDTO.Response updateNotes(Long id, String notes) {
        Delivery delivery = findById(id);
        delivery.setNotes(notes);
        deliveryRepository.save(delivery);
        return mapper.toDeliveryDTO(delivery);
    }

    @Transactional
    public DeliveryDTO.Response uploadProof(Long id, MultipartFile file, String supplierEmail) {
        Delivery delivery = findById(id);
        validateSupplierAccess(delivery, supplierEmail);
        try {
            Path dir = Paths.get(uploadDir + "/proofs");
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            delivery.setProofImageUrl("/" + uploadDir + "/proofs/" + filename);
            deliveryRepository.save(delivery);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save proof image: " + e.getMessage());
        }
        return mapper.toDeliveryDTO(delivery);
    }

    public Page<DeliveryDTO.Response> getHistory(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusYears(1);
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();
        return deliveryRepository.findHistory(start, end, pageable).map(mapper::toDeliveryDTO);
    }

    public List<DeliveryDTO.Response> getForSupplier(String supplierEmail) {
        User supplier = userRepository.findByEmail(supplierEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return deliveryRepository.findBySupplierId(supplier.getId())
                .stream().map(mapper::toDeliveryDTO).toList();
    }

    private void validateSupplierAccess(Delivery delivery, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == User.Role.SUPPLIER
                && !delivery.getSupplier().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied to this delivery");
        }
    }

    private Delivery findById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found: " + id));
    }
}
