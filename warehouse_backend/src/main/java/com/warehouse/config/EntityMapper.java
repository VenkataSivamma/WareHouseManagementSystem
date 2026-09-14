package com.warehouse.config;

import com.warehouse.dto.*;
import com.warehouse.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public AuthDTO.UserResponse toUserResponse(User user) {
        AuthDTO.UserResponse r = new AuthDTO.UserResponse();
        r.setId(user.getId());
        r.setName(user.getName());
        r.setFullName(user.getName());  // alias
        r.setEmail(user.getEmail());
        r.setRole(user.getRole().name());
        r.setPhone(user.getPhone());
        r.setStatus(user.getStatus().name().toLowerCase());  // lowercase
        r.setEmployeeId(user.getEmployeeId());
        r.setDepartment(user.getDepartment());
        r.setWarehouseLocation(user.getWarehouseLocation());
        r.setCreatedAt(user.getCreatedAt());
        r.setUpdatedAt(user.getUpdatedAt());
        if (user instanceof Supplier s) {
            r.setCompanyName(s.getCompanyName());
        }
        return r;
    }

    public UserDTO.Response toUserDTO(User user) {
        UserDTO.Response r = new UserDTO.Response();
        r.setId(user.getId());
        r.setName(user.getName());
        r.setFullName(user.getName());  // alias
        r.setEmail(user.getEmail());
        r.setPhone(user.getPhone());
        r.setRole(user.getRole().name());
        r.setStatus(user.getStatus().name().toLowerCase());  // lowercase
        r.setEmployeeId(user.getEmployeeId());
        r.setDepartment(user.getDepartment());
        r.setWarehouseLocation(user.getWarehouseLocation());
        r.setCreatedAt(user.getCreatedAt());
        r.setUpdatedAt(user.getUpdatedAt());
        return r;
    }

    public SupplierDTO.Response toSupplierDTO(Supplier s) {
        SupplierDTO.Response r = new SupplierDTO.Response();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setEmail(s.getEmail());
        r.setPhone(s.getPhone());
        r.setCompanyName(s.getCompanyName());
        r.setAddress(s.getAddress());
        r.setCompanyAddress(s.getAddress());    // alias
        r.setContactPerson(s.getContactPerson());
        r.setTaxId(s.getTaxId());
        r.setGstNumber(s.getTaxId());           // alias
        r.setBankAccount(s.getBankAccount());
        r.setStatus(s.getStatus().name().toLowerCase());  // lowercase
        r.setRating(s.getRating());
        r.setTotalOrders(s.getTotalOrders());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }

    public CategoryDTO.Response toCategoryDTO(Category c, long productCount) {
        CategoryDTO.Response r = new CategoryDTO.Response();
        r.setId(c.getId());
        r.setName(c.getName());
        r.setDescription(c.getDescription());
        r.setStatus(c.getStatus().name());
        r.setProductCount(productCount);
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }

    public ProductDTO.Response toProductDTO(Product p) {
        ProductDTO.Response r = new ProductDTO.Response();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setSku(p.getSku());
        r.setBarcode(p.getBarcode());
        r.setPrice(p.getPrice());
        r.setCostPrice(p.getCostPrice());
        r.setMinStock(p.getMinStock());
        r.setMaxStock(p.getMaxStock());
        r.setImageUrl(p.getImageUrl());
        r.setStatus(p.getStatus().name().toLowerCase());  // lowercase
        if (p.getCategory() != null) {
            r.setCategoryId(p.getCategory().getId());
            r.setCategoryName(p.getCategory().getName());
        }
        if (p.getSupplier() != null) {
            r.setSupplierId(p.getSupplier().getId());
            r.setSupplierName(p.getSupplier().getName());
        }
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }

    public InventoryDTO.Response toInventoryDTO(Inventory inv) {
        InventoryDTO.Response r = new InventoryDTO.Response();
        r.setId(inv.getId());
        r.setAvailableQuantity(inv.getAvailableQuantity());
        r.setReservedQuantity(inv.getReservedQuantity());
        r.setDamagedQuantity(inv.getDamagedQuantity());
        r.setStatus(inv.getStatus());
        r.setLastUpdated(inv.getLastUpdated());
        if (inv.getProduct() != null) {
            Product p = inv.getProduct();
            r.setProductId(p.getId());
            r.setProductName(p.getName());
            r.setSku(p.getSku());
            r.setMinStock(p.getMinStock());
            if (p.getCategory() != null) r.setCategoryName(p.getCategory().getName());
        }
        return r;
    }

    public InventoryDTO.StockMovementResponse toMovementDTO(StockMovement sm) {
        InventoryDTO.StockMovementResponse r = new InventoryDTO.StockMovementResponse();
        r.setId(sm.getId());
        // display-friendly type for frontend checks (item.type === 'Stock In')
        r.setType(sm.getType() == StockMovement.MovementType.STOCK_IN ? "Stock In" : "Stock Out");
        r.setTypeRaw(sm.getType().name());  // STOCK_IN / STOCK_OUT
        r.setQuantity(sm.getQuantity());
        r.setReason(sm.getReason());
        r.setNotes(sm.getNotes());
        r.setStatus(sm.getStatus().name().toLowerCase());  // lowercase
        r.setReferenceNumber(sm.getReferenceNumber());
        r.setCreatedAt(sm.getCreatedAt());
        if (sm.getProduct() != null) {
            r.setProductId(sm.getProduct().getId());
            r.setProductName(sm.getProduct().getName());
            r.setSku(sm.getProduct().getSku());
        }
        if (sm.getPerformedBy() != null) r.setPerformedBy(sm.getPerformedBy().getName());
        if (sm.getApprovedBy() != null) r.setApprovedBy(sm.getApprovedBy().getName());
        return r;
    }

    public PurchaseOrderDTO.Response toPurchaseOrderDTO(PurchaseOrder po) {
        PurchaseOrderDTO.Response r = new PurchaseOrderDTO.Response();
        r.setId(po.getId());
        r.setOrderNumber(po.getOrderNumber());
        r.setOrderNo(po.getOrderNumber());  // alias
        r.setStatus(po.getStatus().name().toLowerCase());  // lowercase
        r.setTotalAmount(po.getTotalAmount());
        r.setNotes(po.getNotes());
        r.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        r.setCreatedAt(po.getCreatedAt());
        r.setUpdatedAt(po.getUpdatedAt());
        if (po.getSupplier() != null) {
            r.setSupplierId(po.getSupplier().getId());
            r.setSupplierName(po.getSupplier().getName());
        }
        if (po.getCreatedBy() != null) {
            r.setCreatedById(po.getCreatedBy().getId());
            r.setCreatedByName(po.getCreatedBy().getName());
        }
        if (po.getItems() != null) {
            r.setItems(po.getItems().stream().map(item -> {
                PurchaseOrderDTO.ItemResponse ir = new PurchaseOrderDTO.ItemResponse();
                ir.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
                ir.setProductName(item.getProduct() != null ? item.getProduct().getName() : null);
                ir.setSku(item.getProduct() != null ? item.getProduct().getSku() : null);
                ir.setQuantity(item.getQuantity());
                ir.setUnitPrice(item.getUnitPrice());
                ir.setTotalPrice(item.getTotalPrice());
                return ir;
            }).toList());
        }
        return r;
    }

    public DeliveryDTO.Response toDeliveryDTO(Delivery d) {
        DeliveryDTO.Response r = new DeliveryDTO.Response();
        r.setId(d.getId());
        r.setDeliveryNumber(d.getDeliveryNumber());
        r.setStatus(d.getStatus().name());
        r.setScheduledDate(d.getScheduledDate());
        r.setDeliveredDate(d.getDeliveredDate());
        r.setNotes(d.getNotes());
        r.setProofImageUrl(d.getProofImageUrl());
        r.setCreatedAt(d.getCreatedAt());
        r.setUpdatedAt(d.getUpdatedAt());
        if (d.getPurchaseOrder() != null) {
            r.setPurchaseOrderId(d.getPurchaseOrder().getId());
            r.setOrderNumber(d.getPurchaseOrder().getOrderNumber());
            r.setTotalAmount(d.getPurchaseOrder().getTotalAmount());
        }
        if (d.getSupplier() != null) {
            r.setSupplierId(d.getSupplier().getId());
            r.setSupplierName(d.getSupplier().getName());
        }
        return r;
    }
}
