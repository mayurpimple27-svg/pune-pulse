package com.punepulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubscriptionRequest {

    @NotBlank(message = "Area tag is required")
    @Size(max = 100, message = "Area tag must not exceed 100 characters")
    private String areaTag;
}
