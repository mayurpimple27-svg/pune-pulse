package com.punepulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alerts", indexes = {
        @Index(name = "idx_alerts_category", columnList = "category"),
        @Index(name = "idx_alerts_area_tag", columnList = "area_tag"),
        @Index(name = "idx_alerts_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertCategory category;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(name = "confidence_score", nullable = false)
    private Integer confidenceScore;

    @Column(name = "area_tag", nullable = false, length = 100)
    private String areaTag;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private Instant timestamp = Instant.now();
}
