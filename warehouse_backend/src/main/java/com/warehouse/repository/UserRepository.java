package com.warehouse.repository;

import com.warehouse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByEmployeeId(String employeeId);
    boolean existsByEmail(String email);

    Page<User> findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
            User.Role role1, String name, User.Role role2, String email, Pageable pageable);

    List<User> findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
            User.Role role1, String name, User.Role role2, String email);

    Page<User> findByRole(User.Role role, Pageable pageable);
    List<User> findByRole(User.Role role);

    long countByRole(User.Role role);
    long countByRoleAndStatus(User.Role role, User.UserStatus status);

    @Query(value = "SELECT COUNT(*) FROM users WHERE role = :role AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())", nativeQuery = true)
    long countByRoleCreatedThisMonth(@Param("role") String role);
}
