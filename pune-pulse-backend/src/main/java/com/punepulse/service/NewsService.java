package com.punepulse.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.punepulse.dto.NewsArticle;
import com.punepulse.dto.TrafficHotspot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class NewsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.scraper.base-url:http://localhost:8000}")
    private String scraperBaseUrl;

    public NewsService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public List<NewsArticle> getNews(String category, int limit) {
        try {
            String url = scraperBaseUrl + "/news?limit=" + limit;
            if (category != null && !category.isBlank()) {
                url += "&category=" + category;
            }
            String json = restTemplate.getForObject(url, String.class);
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to fetch news from scraper: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<TrafficHotspot> getTrafficHotspots() {
        try {
            String url = scraperBaseUrl + "/traffic";
            String json = restTemplate.getForObject(url, String.class);
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to fetch traffic data from scraper: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
