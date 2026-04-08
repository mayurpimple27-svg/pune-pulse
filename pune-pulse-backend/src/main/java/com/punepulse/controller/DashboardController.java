package com.punepulse.controller;

import com.punepulse.dto.AlertResponse;
import com.punepulse.dto.ApiResponse;
import com.punepulse.security.AppUserPrincipal;
import com.punepulse.service.AlertService;
import com.punepulse.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AlertService alertService;
    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AlertResponse>>> getPersonalizedFeed(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        size = Math.min(size, 100);
        List<String> subscribedAreas = subscriptionService.getUserSubscriptions(principal.getUserId());

        Page<AlertResponse> alerts;
        if (subscribedAreas.isEmpty()) {
            // If no subscriptions, show all alerts
            alerts = alertService.getAlerts(null, null,
                    PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));
        } else {
            alerts = alertService.getAlertsByAreaTags(subscribedAreas,
                    PageRequest.of(page, size));
        }

        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }
}
