package com.warehouse.config;

import com.warehouse.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/*/login",
                                 "/api/auth/register/**",
                                 "/api/auth/forgot-password",
                                 "/api/auth/reset-password").permitAll()
                // Supplier-only profile
                .requestMatchers("/api/suppliers/profile").hasAnyRole("SUPPLIER","ADMIN","MANAGER")
                // Suppliers
                .requestMatchers(HttpMethod.GET, "/api/suppliers/**").hasAnyRole("ADMIN","MANAGER","SUPPLIER")
                .requestMatchers(HttpMethod.PUT, "/api/suppliers/profile").hasAnyRole("SUPPLIER","ADMIN")
                .requestMatchers("/api/suppliers/**").hasRole("ADMIN")
                // Categories
                .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAnyRole("ADMIN","MANAGER","STAFF")
                .requestMatchers("/api/categories/**").hasRole("ADMIN")
                // Products
                .requestMatchers(HttpMethod.GET, "/api/products/**").hasAnyRole("ADMIN","MANAGER","STAFF")
                .requestMatchers("/api/products/**").hasRole("ADMIN")
                // Managers
                .requestMatchers("/api/managers/**").hasRole("ADMIN")
                // Staff
                .requestMatchers("/api/staff/**").hasAnyRole("ADMIN","MANAGER")
                // Inventory
                .requestMatchers("/api/inventory/stock-in", "/api/inventory/stock-out",
                                 "/api/inventory/available").hasAnyRole("STAFF","MANAGER","ADMIN")
                .requestMatchers("/api/inventory/stock-in/*/approve",
                                 "/api/inventory/stock-out/*/approve",
                                 "/api/inventory/*/reject").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN","MANAGER","STAFF")
                // Purchase Orders
                .requestMatchers("/api/purchase-orders/supplier").hasRole("SUPPLIER")
                .requestMatchers("/api/purchase-orders/*/accept").hasRole("SUPPLIER")
                .requestMatchers("/api/purchase-orders/simple").hasAnyRole("MANAGER","ADMIN")
                .requestMatchers("/api/purchase-orders/**").hasAnyRole("ADMIN","MANAGER","SUPPLIER")
                // Deliveries
                .requestMatchers("/api/deliveries/supplier").hasRole("SUPPLIER")
                .requestMatchers("/api/deliveries/*/status", "/api/deliveries/*/delivered",
                                 "/api/deliveries/*/proof").hasAnyRole("SUPPLIER","ADMIN")
                .requestMatchers("/api/deliveries/**").hasAnyRole("ADMIN","MANAGER","SUPPLIER")
                // Dashboard
                .requestMatchers("/api/dashboard/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/manager/**").hasAnyRole("ADMIN","MANAGER")
                .requestMatchers("/api/dashboard/staff/**").hasAnyRole("ADMIN","MANAGER","STAFF")
                .requestMatchers("/api/dashboard/supplier/**").hasRole("SUPPLIER")
                // Reports
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN","MANAGER")
                // Notifications
                .requestMatchers("/api/notifications/**").authenticated()
                // Auth (authenticated)
                .requestMatchers("/api/auth/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
