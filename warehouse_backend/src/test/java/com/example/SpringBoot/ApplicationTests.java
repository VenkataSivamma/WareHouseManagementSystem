package com.example.SpringBoot;

import com.warehouse.WarehouseApplication;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = WarehouseApplication.class)
@ActiveProfiles("dev")
class ApplicationTests {

	@Test
	void contextLoads() {
	}

}
