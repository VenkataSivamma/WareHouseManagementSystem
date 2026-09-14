package com.warehouse.service;

import com.warehouse.config.EntityMapper;
import com.warehouse.dto.CategoryDTO;
import com.warehouse.entity.Category;
import com.warehouse.exception.*;
import com.warehouse.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final EntityMapper mapper;

    public Page<CategoryDTO.Response> getAll(Pageable pageable) {
        return categoryRepository.findAll(pageable)
                .map(c -> mapper.toCategoryDTO(c, productRepository.findByCategory(c).size()));
    }

    public CategoryDTO.Response getById(Long id) {
        Category c = findById(id);
        return mapper.toCategoryDTO(c, productRepository.findByCategory(c).size());
    }

    @Transactional
    public CategoryDTO.Response create(CategoryDTO.Request req) {
        Category c = Category.builder()
                .name(req.getName()).description(req.getDescription())
                .status(Category.CategoryStatus.ACTIVE).build();
        categoryRepository.save(c);
        return mapper.toCategoryDTO(c, 0);
    }

    @Transactional
    public CategoryDTO.Response update(Long id, CategoryDTO.Request req) {
        Category c = findById(id);
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        categoryRepository.save(c);
        return mapper.toCategoryDTO(c, productRepository.findByCategory(c).size());
    }

    @Transactional
    public void delete(Long id) {
        categoryRepository.delete(findById(id));
    }

    @Transactional
    public CategoryDTO.Response toggleStatus(Long id) {
        Category c = findById(id);
        c.setStatus(c.getStatus() == Category.CategoryStatus.ACTIVE
                ? Category.CategoryStatus.INACTIVE : Category.CategoryStatus.ACTIVE);
        categoryRepository.save(c);
        return mapper.toCategoryDTO(c, productRepository.findByCategory(c).size());
    }

    public List<CategoryDTO.Response> search(String q) {
        return categoryRepository.findByNameContainingIgnoreCase(q).stream()
                .map(c -> mapper.toCategoryDTO(c, productRepository.findByCategory(c).size()))
                .toList();
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }
}
