package com.punepulse.repository;

import com.punepulse.entity.Alert;
import com.punepulse.entity.AlertCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    Page<Alert> findByCategory(AlertCategory category, Pageable pageable);

    Page<Alert> findByAreaTag(String areaTag, Pageable pageable);

    Page<Alert> findByCategoryAndAreaTag(AlertCategory category, String areaTag, Pageable pageable);

    @Query("SELECT DISTINCT a.areaTag FROM Alert a ORDER BY a.areaTag")
    List<String> findDistinctAreaTags();

    @Query("SELECT a FROM Alert a WHERE a.areaTag IN :areaTags ORDER BY a.timestamp DESC")
    Page<Alert> findByAreaTagIn(@Param("areaTags") List<String> areaTags, Pageable pageable);

    @Query("""
            SELECT a FROM Alert a
            WHERE (:category IS NULL OR a.category = :category)
            AND (:areaTag IS NULL OR a.areaTag = :areaTag)
            ORDER BY a.timestamp DESC
            """)
    Page<Alert> findFiltered(@Param("category") AlertCategory category,
                             @Param("areaTag") String areaTag,
                             Pageable pageable);
}
