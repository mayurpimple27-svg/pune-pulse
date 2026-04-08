package com.punepulse.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ChatResponse {
    private String answer;
    private List<AlertResponse> relatedAlerts;
}
