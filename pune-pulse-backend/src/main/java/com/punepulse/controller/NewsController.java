package com.punepulse.controller;

import com.punepulse.dto.ApiResponse;
import com.punepulse.dto.NewsArticle;
import com.punepulse.dto.TrafficHotspot;
import com.punepulse.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/news")
    public ResponseEntity<ApiResponse<List<NewsArticle>>> getNews(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "20") int limit) {
        List<NewsArticle> news = newsService.getNews(category, Math.min(limit, 50));
        return ResponseEntity.ok(ApiResponse.ok(news));
    }

    @GetMapping("/traffic/hotspots")
    public ResponseEntity<ApiResponse<List<TrafficHotspot>>> getTrafficHotspots() {
        List<TrafficHotspot> hotspots = newsService.getTrafficHotspots();
        return ResponseEntity.ok(ApiResponse.ok(hotspots));
    }
}
