package com.warehouse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@DiscriminatorValue("SUPPLIER")
@Getter @Setter @NoArgsConstructor
public class Supplier extends User {

    private String companyName;
    private String address;
    private String contactPerson;
    private String taxId;
    private String bankAccount;
    private Double rating = 0.0;
    private Integer totalOrders = 0;
}
