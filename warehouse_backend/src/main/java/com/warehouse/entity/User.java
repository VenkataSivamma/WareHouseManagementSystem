package com.warehouse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("USER")
@Getter @Setter @NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    private String employeeId;
    private String department;
    private String warehouseLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    public User(String name, String email, String password, String phone, Role role, UserStatus status) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.status = status != null ? status : UserStatus.ACTIVE;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String name, email, password, phone;
        private String employeeId, department, warehouseLocation;
        private Role role;
        private UserStatus status = UserStatus.ACTIVE;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder employeeId(String employeeId) { this.employeeId = employeeId; return this; }
        public UserBuilder department(String department) { this.department = department; return this; }
        public UserBuilder warehouseLocation(String warehouseLocation) { this.warehouseLocation = warehouseLocation; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder status(UserStatus status) { this.status = status; return this; }

        public User build() {
            User u = new User();
            u.id = this.id;
            u.name = this.name;
            u.email = this.email;
            u.password = this.password;
            u.phone = this.phone;
            u.employeeId = this.employeeId;
            u.department = this.department;
            u.warehouseLocation = this.warehouseLocation;
            u.role = this.role;
            u.status = this.status;
            return u;
        }
    }

    public enum Role {
        ADMIN, MANAGER, STAFF, SUPPLIER
    }

    public enum UserStatus {
        ACTIVE, INACTIVE
    }
}
