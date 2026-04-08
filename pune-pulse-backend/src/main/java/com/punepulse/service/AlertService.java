package com.punepulse.service;

import com.punepulse.dto.AlertResponse;
import com.punepulse.entity.Alert;
import com.punepulse.entity.AlertCategory;
import com.punepulse.exception.ResourceNotFoundException;
import com.punepulse.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    @Transactional(readOnly = true)
    public Page<AlertResponse> getAlerts(AlertCategory category, String areaTag, Pageable pageable) {
        return alertRepository.findFiltered(category, areaTag, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AlertResponse getAlertById(UUID id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        return toResponse(alert);
    }

    @Transactional(readOnly = true)
    public Page<AlertResponse> getAlertsByAreaTags(List<String> areaTags, Pageable pageable) {
        return alertRepository.findByAreaTagIn(areaTags, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<String> getAllAreaTags() {
        return alertRepository.findDistinctAreaTags();
    }

    @Transactional
    public AlertResponse createAlert(Alert alert) {
        alert = alertRepository.save(alert);
        return toResponse(alert);
    }

    @Transactional
    public void verifyAlert(UUID id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        alert.setIsVerified(true);
        alertRepository.save(alert);
    }

    @Transactional
    public void deleteAlert(UUID id) {
        if (!alertRepository.existsById(id)) {
            throw new ResourceNotFoundException("Alert not found: " + id);
        }
        alertRepository.deleteById(id);
    }

    private AlertResponse toResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .title(alert.getTitle())
                .summary(alert.getSummary())
                .category(alert.getCategory())
                .sourceUrl(alert.getSourceUrl())
                .confidenceScore(alert.getConfidenceScore())
                .areaTag(alert.getAreaTag())
                .isVerified(alert.getIsVerified())
                .timestamp(alert.getTimestamp())
                .build();
    }
}
