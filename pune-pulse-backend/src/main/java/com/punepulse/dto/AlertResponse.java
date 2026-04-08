package com.punepulse.dto;

import com.punepulse.entity.AlertCategory;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AlertResponse {
    private UUID id;
    private String title;
    private String summary;
    private AlertCategory category;
    private String sourceUrl;
    private Integer confidenceScore;
    private String areaTag;
    private Boolean isVerified;
    private Instant timestamp;
}
