package com.punepulse.controller;

import com.punepulse.dto.AlertResponse;
import com.punepulse.dto.ApiResponse;
import com.punepulse.entity.AlertCategory;
import com.punepulse.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AlertResponse>>> getAlerts(
            @RequestParam(required = false) AlertCategory category,
            @RequestParam(required = false) String areaTag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        size = Math.min(size, 100);
        Page<AlertResponse> alerts = alertService.getAlerts(category, areaTag,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertResponse>> getAlert(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(alertService.getAlertById(id)));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyAlert(@PathVariable UUID id) {
        alertService.verifyAlert(id);
        return ResponseEntity.ok(ApiResponse.ok("Alert verified", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(@PathVariable UUID id) {
        alertService.deleteAlert(id);
        return ResponseEntity.ok(ApiResponse.ok("Alert deleted", null));
    }
}
