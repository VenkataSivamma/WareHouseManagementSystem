package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.InventoryDTO;
import com.warehouse.entity.*;
import com.warehouse.exception.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    public Page<InventoryDTO.Response> getAll(String search, Long categoryId, String status, Pageable pageable) {
        return inventoryRepository.findWithFilters(search, categoryId, status, pageable)
                .map(mapper::toInventoryDTO);
    }

    public InventoryDTO.Response getById(Long id) {
        return mapper.toInventoryDTO(inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found: " + id)));
    }

    public InventoryDTO.Response getByProductId(Long productId) {
        return mapper.toInventoryDTO(inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId)));
    }

    public Page<InventoryDTO.Response> getAvailable(String search, Pageable pageable) {
        if (search != null && !search.isBlank())
            return inventoryRepository.findAvailableWithSearch(search, pageable).map(mapper::toInventoryDTO);
        return inventoryRepository.findAvailable(pageable).map(mapper::toInventoryDTO);
    }

    public List<InventoryDTO.Response> getReserved() {
        return inventoryRepository.findByStatus("reserved").stream().map(mapper::toInventoryDTO).toList();
    }

    public List<InventoryDTO.Response> getDamaged() {
        return inventoryRepository.findByStatus("damaged").stream().map(mapper::toInventoryDTO).toList();
    }

    public List<InventoryDTO.Response> getLowStock() {
        return inventoryRepository.findLowStock().stream().map(mapper::toInventoryDTO).toList();
    }

    public Page<InventoryDTO.StockMovementResponse> getMovements(String type, Long productId, Pageable pageable) {
        StockMovement.MovementType mt = type != null ? StockMovement.MovementType.valueOf(type) : null;
        return movementRepository.findWithFilters(mt, productId, pageable).map(mapper::toMovementDTO);
    }

    public List<InventoryDTO.StockMovementResponse> getHistory(Long productId) {
        return movementRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(mapper::toMovementDTO).toList();
    }

    public Page<InventoryDTO.StockMovementResponse> getHistoryPaged(Long productId, Pageable pageable) {
        return movementRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(mapper::toMovementDTO);
    }

    @Transactional
    public InventoryDTO.StockMovementResponse stockIn(InventoryDTO.StockRequest req, String performedByEmail) {
        return createMovement(req, StockMovement.MovementType.STOCK_IN, performedByEmail);
    }

    @Transactional
    public InventoryDTO.StockMovementResponse stockOut(InventoryDTO.StockRequest req, String performedByEmail) {
        return createMovement(req, StockMovement.MovementType.STOCK_OUT, performedByEmail);
    }

    private InventoryDTO.StockMovementResponse createMovement(InventoryDTO.StockRequest req,
                                                               StockMovement.MovementType type,
                                                               String email) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        User performer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        StockMovement sm = StockMovement.builder()
                .product(product).type(type).quantity(req.getQuantity())
                .reason(req.resolvedReason()).notes(req.getNotes())
                .referenceNumber(req.getReferenceNumber())
                .performedBy(performer).status(StockMovement.MovementStatus.PENDING).build();
        movementRepository.save(sm);
        return mapper.toMovementDTO(sm);
    }

    @Transactional
    public InventoryDTO.StockMovementResponse approveStockIn(Long id, String approverEmail) {
        StockMovement sm = findMovement(id);
        if (sm.getType() != StockMovement.MovementType.STOCK_IN)
            throw new IllegalArgumentException("Not a stock-in movement");
        if (sm.getStatus() != StockMovement.MovementStatus.PENDING)
            throw new IllegalArgumentException("Movement is not pending");

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        sm.setStatus(StockMovement.MovementStatus.APPROVED);
        sm.setApprovedBy(approver);
        movementRepository.save(sm);

        Inventory inv = inventoryRepository.findByProduct(sm.getProduct())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        inv.setAvailableQuantity(inv.getAvailableQuantity() + sm.getQuantity());
        inv.recomputeStatus();
        inventoryRepository.save(inv);

        return mapper.toMovementDTO(sm);
    }

    @Transactional
    public InventoryDTO.StockMovementResponse approveStockOut(Long id, String approverEmail) {
        StockMovement sm = findMovement(id);
        if (sm.getType() != StockMovement.MovementType.STOCK_OUT)
            throw new IllegalArgumentException("Not a stock-out movement");
        if (sm.getStatus() != StockMovement.MovementStatus.PENDING)
            throw new IllegalArgumentException("Movement is not pending");

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        sm.setStatus(StockMovement.MovementStatus.APPROVED);
        sm.setApprovedBy(approver);
        movementRepository.save(sm);

        Inventory inv = inventoryRepository.findByProduct(sm.getProduct())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        if (inv.getAvailableQuantity() < sm.getQuantity())
            throw new IllegalArgumentException("Insufficient stock");
        inv.setAvailableQuantity(inv.getAvailableQuantity() - sm.getQuantity());
        inv.setReservedQuantity(inv.getReservedQuantity() + sm.getQuantity());
        inv.recomputeStatus();
        inventoryRepository.save(inv);

        return mapper.toMovementDTO(sm);
    }

    @Transactional
    public InventoryDTO.StockMovementResponse reject(Long id, String reason, String approverEmail) {
        StockMovement sm = findMovement(id);
        if (sm.getStatus() != StockMovement.MovementStatus.PENDING)
            throw new IllegalArgumentException("Movement is not pending");
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        sm.setStatus(StockMovement.MovementStatus.REJECTED);
        sm.setApprovedBy(approver);
        sm.setNotes((sm.getNotes() != null ? sm.getNotes() + " | " : "") + "Rejected: " + reason);
        movementRepository.save(sm);
        return mapper.toMovementDTO(sm);
    }

    private StockMovement findMovement(Long id) {
        return movementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock movement not found: " + id));
    }
}
