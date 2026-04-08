package com.punepulse.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrafficHotspot {
    private String area;
    private Double lat;
    private Double lng;
    private String severity;
    private String description;
    private String updated;
}
