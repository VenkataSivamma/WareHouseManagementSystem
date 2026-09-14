package com.warehouse.controller;

import com.warehouse.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> inventoryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getInventoryReport(startDate, endDate));
    }

    @GetMapping("/supplier")
    public ResponseEntity<Map<String, Object>> supplierReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long supplierId) {
        return ResponseEntity.ok(reportService.getSupplierReport(startDate, endDate, supplierId));
    }

    @GetMapping("/purchase")
    public ResponseEntity<Map<String, Object>> purchaseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(reportService.getPurchaseReport(startDate, endDate, status));
    }

    @GetMapping("/product")
    public ResponseEntity<Map<String, Object>> productReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(reportService.getProductReport(startDate, endDate, categoryId));
    }

    @GetMapping("/stock-movement")
    public ResponseEntity<Map<String, Object>> stockMovementReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(reportService.getStockMovementReport(startDate, endDate, type));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<Map<String, Object>> lowStockReport() {
        return ResponseEntity.ok(reportService.getLowStockReport());
    }

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> monthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(year, month));
    }

    @GetMapping("/inventory/download")
    public ResponseEntity<byte[]> downloadInventory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "excel") String format) {
        return buildDownloadResponse(reportService.downloadReport("inventory", format), format, "inventory-report");
    }

    @GetMapping("/purchase/download")
    public ResponseEntity<byte[]> downloadPurchase(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "excel") String format) {
        return buildDownloadResponse(reportService.downloadReport("purchase", format), format, "purchase-report");
    }

    @GetMapping("/stock-movement/download")
    public ResponseEntity<byte[]> downloadStockMovement(
            @RequestParam(defaultValue = "excel") String format) {
        return buildDownloadResponse(reportService.downloadReport("stock-movement", format), format, "stock-movement-report");
    }

    private ResponseEntity<byte[]> buildDownloadResponse(byte[] data, String format, String filename) {
        MediaType mediaType = "pdf".equalsIgnoreCase(format)
                ? MediaType.APPLICATION_PDF
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String ext = "pdf".equalsIgnoreCase(format) ? ".pdf" : ".xlsx";
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + ext + "\"")
                .body(data);
    }
}
