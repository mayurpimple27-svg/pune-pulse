package com.punepulse.controller;

import com.punepulse.dto.ApiResponse;
import com.punepulse.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/areas")
@RequiredArgsConstructor
public class AreaController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getAllAreas() {
        return ResponseEntity.ok(ApiResponse.ok(alertService.getAllAreaTags()));
    }
}
