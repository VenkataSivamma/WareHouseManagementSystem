package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.PurchaseOrderDTO;
import com.warehouse.entity.*;
import com.warehouse.exception.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository orderRepository;
    private final PurchaseOrderTimelineRepository timelineRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final DeliveryRepository deliveryRepository;
    private final EntityMapper mapper;

    private static final AtomicInteger sequence = new AtomicInteger(1);

    public Page<PurchaseOrderDTO.Response> getAll(String status, Long supplierId, String search, Pageable pageable) {
        PurchaseOrder.OrderStatus os = status != null ? PurchaseOrder.OrderStatus.valueOf(status) : null;
        return orderRepository.findWithFilters(os, supplierId, search, pageable).map(mapper::toPurchaseOrderDTO);
    }

    public PurchaseOrderDTO.Response getById(Long id) {
        return mapper.toPurchaseOrderDTO(findById(id));
    }

    @Transactional
    public PurchaseOrderDTO.Response create(PurchaseOrderDTO.CreateRequest req, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User supplier = userRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        PurchaseOrder order = PurchaseOrder.builder()
                .orderNumber(generateOrderNumber())
                .supplier(supplier).createdBy(creator)
                .status(PurchaseOrder.OrderStatus.PENDING)
                .notes(req.getNotes())
                .expectedDeliveryDate(req.getExpectedDeliveryDate())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderDTO.ItemRequest ir : req.getItems()) {
            Product product = productRepository.findById(ir.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + ir.getProductId()));
            BigDecimal lineTotal = ir.getUnitPrice().multiply(BigDecimal.valueOf(ir.getQuantity()));
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order).product(product)
                    .quantity(ir.getQuantity()).unitPrice(ir.getUnitPrice()).totalPrice(lineTotal).build();
            order.getItems().add(item);
            total = total.add(lineTotal);
        }
        order.setTotalAmount(total);
        orderRepository.save(order);
        addTimeline(order, "PENDING", "Order created", creator);
        return mapper.toPurchaseOrderDTO(order);
    }

    @Transactional
    public PurchaseOrderDTO.Response createSimple(PurchaseOrderDTO.SimpleCreateRequest req, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User supplier = userRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.getProductId()));

        BigDecimal unitPrice = req.resolvedUnitPrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(req.getQuantity()));

        PurchaseOrder order = PurchaseOrder.builder()
                .orderNumber(generateOrderNumber())
                .supplier(supplier).createdBy(creator)
                .status(PurchaseOrder.OrderStatus.PENDING)
                .notes(req.getNotes())
                .expectedDeliveryDate(req.getExpectedDeliveryDate())
                .build();

        PurchaseOrderItem item = PurchaseOrderItem.builder()
                .purchaseOrder(order).product(product)
                .quantity(req.getQuantity()).unitPrice(unitPrice).totalPrice(lineTotal).build();
        order.getItems().add(item);
        order.setTotalAmount(lineTotal);
        orderRepository.save(order);
        addTimeline(order, "PENDING", "Order created", creator);
        return mapper.toPurchaseOrderDTO(order);
    }

    @Transactional
    public PurchaseOrderDTO.Response updateSimple(Long id, PurchaseOrderDTO.SimpleCreateRequest req, String editorEmail) {
        PurchaseOrder order = findById(id);
        if (order.getStatus() != PurchaseOrder.OrderStatus.PENDING)
            throw new IllegalArgumentException("Only PENDING orders can be updated");
        User supplier = userRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.getProductId()));
        BigDecimal unitPrice = req.resolvedUnitPrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(req.getQuantity()));
        order.setSupplier(supplier);
        order.setNotes(req.getNotes());
        order.getItems().clear();
        PurchaseOrderItem item = PurchaseOrderItem.builder()
                .purchaseOrder(order).product(product)
                .quantity(req.getQuantity()).unitPrice(unitPrice).totalPrice(lineTotal).build();
        order.getItems().add(item);
        order.setTotalAmount(lineTotal);
        orderRepository.save(order);
        return mapper.toPurchaseOrderDTO(order);
    }

    @Transactional
    public PurchaseOrderDTO.Response update(Long id, PurchaseOrderDTO.CreateRequest req, String editorEmail) {
        PurchaseOrder order = findById(id);
        if (order.getStatus() != PurchaseOrder.OrderStatus.PENDING)
            throw new IllegalArgumentException("Only PENDING orders can be updated");

        User supplier = userRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        order.setSupplier(supplier);
        order.setNotes(req.getNotes());
        order.setExpectedDeliveryDate(req.getExpectedDeliveryDate());
        order.getItems().clear();

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderDTO.ItemRequest ir : req.getItems()) {
            Product product = productRepository.findById(ir.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + ir.getProductId()));
            BigDecimal lineTotal = ir.getUnitPrice().multiply(BigDecimal.valueOf(ir.getQuantity()));
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order).product(product)
                    .quantity(ir.getQuantity()).unitPrice(ir.getUnitPrice()).totalPrice(lineTotal).build();
            order.getItems().add(item);
            total = total.add(lineTotal);
        }
        order.setTotalAmount(total);
        orderRepository.save(order);
        return mapper.toPurchaseOrderDTO(order);
    }

    @Transactional
    public void delete(Long id) {
        orderRepository.delete(findById(id));
    }

    @Transactional
    public PurchaseOrderDTO.Response approve(Long id, String approverEmail) {
        return changeStatus(id, PurchaseOrder.OrderStatus.APPROVED, "Order approved", approverEmail);
    }

    @Transactional
    public PurchaseOrderDTO.Response reject(Long id, String reason, String approverEmail) {
        return changeStatus(id, PurchaseOrder.OrderStatus.REJECTED, "Rejected: " + reason, approverEmail);
    }

    @Transactional
    public PurchaseOrderDTO.Response complete(Long id, String approverEmail) {
        return changeStatus(id, PurchaseOrder.OrderStatus.COMPLETED, "Order completed", approverEmail);
    }

    @Transactional
    public PurchaseOrderDTO.Response cancel(Long id, String approverEmail) {
        return changeStatus(id, PurchaseOrder.OrderStatus.CANCELLED, "Order cancelled", approverEmail);
    }

    @Transactional
    public PurchaseOrderDTO.Response assignSupplier(Long id, Long supplierId, String editorEmail) {
        PurchaseOrder order = findById(id);
        User supplier = userRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        order.setSupplier(supplier);
        orderRepository.save(order);
        return mapper.toPurchaseOrderDTO(order);
    }

    @Transactional
    public PurchaseOrderDTO.Response accept(Long id, String supplierEmail) {
        PurchaseOrder order = findById(id);
        User supplier = userRepository.findByEmail(supplierEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!order.getSupplier().getId().equals(supplier.getId()))
            throw new UnauthorizedException("You are not the assigned supplier for this order");
        if (order.getStatus() != PurchaseOrder.OrderStatus.APPROVED)
            throw new IllegalArgumentException("Order must be APPROVED before accepting");

        order.setStatus(PurchaseOrder.OrderStatus.ACCEPTED);
        orderRepository.save(order);
        addTimeline(order, "ACCEPTED", "Order accepted by supplier", supplier);

        // Auto-create delivery
        String deliveryNumber = "DEL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%04d", sequence.getAndIncrement());
        Delivery delivery = Delivery.builder()
                .deliveryNumber(deliveryNumber)
                .purchaseOrder(order).supplier(supplier)
                .status(Delivery.DeliveryStatus.PENDING)
                .scheduledDate(order.getExpectedDeliveryDate())
                .build();
        deliveryRepository.save(delivery);

        return mapper.toPurchaseOrderDTO(order);
    }

    public List<PurchaseOrderDTO.Response> getForSupplier(String supplierEmail) {
        User supplier = userRepository.findByEmail(supplierEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findBySupplierId(supplier.getId())
                .stream().map(mapper::toPurchaseOrderDTO).toList();
    }

    public List<PurchaseOrderDTO.TimelineResponse> getTimeline(Long id) {
        return timelineRepository.findByPurchaseOrderIdOrderByChangedAtAsc(id)
                .stream().map(t -> {
                    PurchaseOrderDTO.TimelineResponse r = new PurchaseOrderDTO.TimelineResponse();
                    r.setId(t.getId());
                    r.setStatus(t.getStatus());
                    r.setNote(t.getNote());
                    r.setChangedByName(t.getChangedBy() != null ? t.getChangedBy().getName() : null);
                    r.setChangedAt(t.getChangedAt());
                    return r;
                }).toList();
    }

    public List<PurchaseOrderDTO.Response> search(String q) {
        return orderRepository.findByOrderNumberContainingIgnoreCase(q)
                .stream().map(mapper::toPurchaseOrderDTO).toList();
    }

    private PurchaseOrderDTO.Response changeStatus(Long id, PurchaseOrder.OrderStatus newStatus,
                                                    String note, String userEmail) {
        PurchaseOrder order = findById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        order.setStatus(newStatus);
        orderRepository.save(order);
        addTimeline(order, newStatus.name(), note, user);
        return mapper.toPurchaseOrderDTO(order);
    }

    private void addTimeline(PurchaseOrder order, String status, String note, User changedBy) {
        PurchaseOrderTimeline timeline = PurchaseOrderTimeline.builder()
                .purchaseOrder(order).status(status).note(note).changedBy(changedBy).build();
        timelineRepository.save(timeline);
    }

    private PurchaseOrder findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + id));
    }

    private String generateOrderNumber() {
        return "PO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%04d", sequence.getAndIncrement());
    }
}
