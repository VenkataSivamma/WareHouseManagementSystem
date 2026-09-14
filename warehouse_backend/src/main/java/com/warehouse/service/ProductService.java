package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.ProductDTO;
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
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final EntityMapper mapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Page<ProductDTO.Response> getAll(String search, Long categoryId, String status, Pageable pageable) {
        Product.ProductStatus ps = status != null ? Product.ProductStatus.valueOf(status) : null;
        return productRepository.findWithFilters(search, categoryId, ps, pageable)
                .map(mapper::toProductDTO);
    }

    public ProductDTO.Response getById(Long id) {
        return mapper.toProductDTO(findById(id));
    }

    public ProductDTO.Response getBySku(String sku) {
        return mapper.toProductDTO(productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku)));
    }

    public ProductDTO.Response getByBarcode(String barcode) {
        return mapper.toProductDTO(productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode)));
    }

    public List<ProductDTO.Response> getByCategory(Long categoryId) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
        return productRepository.findByCategory(cat).stream().map(mapper::toProductDTO).toList();
    }

    public List<ProductDTO.Response> getLowStock() {
        return productRepository.findLowStockProducts().stream().map(mapper::toProductDTO).toList();
    }

    public List<ProductDTO.Response> search(String q) {
        return productRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(q, q)
                .stream().map(mapper::toProductDTO).toList();
    }

    @Transactional
    public ProductDTO.Response create(String name, String description, String sku, String barcode,
                                      BigDecimal price, BigDecimal costPrice, Integer minStock, Integer maxStock,
                                      Long categoryId, Long supplierId, Integer quantity, MultipartFile image) {
        if (productRepository.existsBySku(sku)) throw new ConflictException("SKU already exists: " + sku);
        if (barcode != null && productRepository.existsByBarcode(barcode))
            throw new ConflictException("Barcode already exists: " + barcode);

        Product product = Product.builder()
                .name(name).description(description).sku(sku).barcode(barcode)
                .price(price).costPrice(costPrice).minStock(minStock).maxStock(maxStock)
                .status(Product.ProductStatus.ACTIVE).build();

        if (categoryId != null) product.setCategory(categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        if (supplierId != null) product.setSupplier(userRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found")));
        if (image != null && !image.isEmpty()) product.setImageUrl(saveImage(image));

        productRepository.save(product);

        int initialQty = (quantity != null && quantity > 0) ? quantity : 0;
        Inventory inv = Inventory.builder().product(product)
                .availableQuantity(initialQty).reservedQuantity(0).damagedQuantity(0).build();
        inv.recomputeStatus();
        inventoryRepository.save(inv);

        return mapper.toProductDTO(product);
    }

    @Transactional
    public ProductDTO.Response update(Long id, String name, String description, String sku, String barcode,
                                      BigDecimal price, BigDecimal costPrice, Integer minStock, Integer maxStock,
                                      Long categoryId, Long supplierId, MultipartFile image) {
        Product product = findById(id);
        if (name != null) product.setName(name);
        if (description != null) product.setDescription(description);
        if (sku != null && !sku.equals(product.getSku())) {
            if (productRepository.existsBySku(sku)) throw new ConflictException("SKU already exists");
            product.setSku(sku);
        }
        if (barcode != null && !barcode.equals(product.getBarcode())) {
            if (productRepository.existsByBarcode(barcode)) throw new ConflictException("Barcode already exists");
            product.setBarcode(barcode);
        }
        if (price != null) product.setPrice(price);
        if (costPrice != null) product.setCostPrice(costPrice);
        if (minStock != null) product.setMinStock(minStock);
        if (maxStock != null) product.setMaxStock(maxStock);
        if (categoryId != null) product.setCategory(categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        if (supplierId != null) product.setSupplier(userRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found")));
        if (image != null && !image.isEmpty()) product.setImageUrl(saveImage(image));

        productRepository.save(product);
        return mapper.toProductDTO(product);
    }

    @Transactional
    public void delete(Long id) {
        productRepository.delete(findById(id));
    }

    @Transactional
    public ProductDTO.Response toggleStatus(Long id) {
        Product p = findById(id);
        p.setStatus(p.getStatus() == Product.ProductStatus.ACTIVE
                ? Product.ProductStatus.INACTIVE : Product.ProductStatus.ACTIVE);
        productRepository.save(p);
        return mapper.toProductDTO(p);
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private String saveImage(MultipartFile file) {
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/" + uploadDir + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image: " + e.getMessage());
        }
    }
}
