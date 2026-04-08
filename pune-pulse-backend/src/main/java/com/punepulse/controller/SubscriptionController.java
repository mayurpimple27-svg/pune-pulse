package com.punepulse.controller;

import com.punepulse.dto.ApiResponse;
import com.punepulse.dto.SubscriptionRequest;
import com.punepulse.security.AppUserPrincipal;
import com.punepulse.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getMySubscriptions(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        List<String> tags = subscriptionService.getUserSubscriptions(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(tags));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> subscribe(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @Valid @RequestBody SubscriptionRequest request) {
        subscriptionService.subscribe(principal.getUserId(), request.getAreaTag());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Subscribed to " + request.getAreaTag(), null));
    }

    @DeleteMapping("/{areaTag}")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String areaTag) {
        subscriptionService.unsubscribe(principal.getUserId(), areaTag);
        return ResponseEntity.ok(ApiResponse.ok("Unsubscribed from " + areaTag, null));
    }
}
