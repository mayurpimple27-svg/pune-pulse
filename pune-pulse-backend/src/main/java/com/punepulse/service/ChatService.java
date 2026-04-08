package com.punepulse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.punepulse.dto.AlertResponse;
import com.punepulse.dto.ChatResponse;
import com.punepulse.dto.NewsArticle;
import com.punepulse.entity.Alert;
import com.punepulse.entity.AlertCategory;
import com.punepulse.repository.AlertRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ChatService {

    private final AlertRepository alertRepository;
    private final NewsService newsService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${app.gemini.cache-ttl-minutes:5}")
    private int cacheTtlMinutes;

    // Simple in-memory response cache: cacheKey -> (answer, expiry)
    private final Map<String, CacheEntry> responseCache = new ConcurrentHashMap<>();

    // Tracks when we should stop calling Gemini due to rate limiting (retry-after)
    private volatile Instant retryAfter = Instant.EPOCH;

    public ChatService(AlertRepository alertRepository, NewsService newsService, ObjectMapper objectMapper) {
        this.alertRepository = alertRepository;
        this.newsService = newsService;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public ChatResponse askPune(String question) {
        String lowerQ = question.toLowerCase();

        AlertCategory detectedCategory = detectCategory(lowerQ);
        String detectedArea = detectArea(lowerQ);

        List<Alert> relevant = alertRepository.findFiltered(
                detectedCategory, detectedArea,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "timestamp"))
        ).getContent();

        List<AlertResponse> alertResponses = relevant.stream()
                .map(a -> AlertResponse.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .summary(a.getSummary())
                        .category(a.getCategory())
                        .sourceUrl(a.getSourceUrl())
                        .confidenceScore(a.getConfidenceScore())
                        .areaTag(a.getAreaTag())
                        .isVerified(a.getIsVerified())
                        .timestamp(a.getTimestamp())
                        .build())
                .toList();

        // Fetch real news from scraper (always, regardless of category)
        List<NewsArticle> newsArticles = newsService.getNews(
                detectedCategory != null ? detectedCategory.name() : null, 6);

        // Check cache first
        String cacheKey = buildCacheKey(lowerQ, detectedCategory, detectedArea);
        String cached = getCached(cacheKey);
        if (cached != null) {
            log.debug("Cache hit for question: {}", question);
            return ChatResponse.builder().answer(cached).relatedAlerts(alertResponses).build();
        }

        String answer;
        if (Instant.now().isBefore(retryAfter)) {
            log.warn("Gemini rate-limited, using smart fallback until {}", retryAfter);
            answer = smartFallback(question, alertResponses, newsArticles);
        } else {
            answer = callGemini(question, alertResponses, newsArticles);
        }

        putCache(cacheKey, answer);
        return ChatResponse.builder().answer(answer).relatedAlerts(alertResponses).build();
    }

    private String callGemini(String question, List<AlertResponse> alerts, List<NewsArticle> news) {
        try {
            String prompt = buildPrompt(question, alerts, news);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + geminiModel + ":generateContent?key=" + geminiApiKey;

            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");
            contents.addObject().putArray("parts").addObject().put("text", prompt);

            requestBody.putObject("generationConfig")
                    .put("temperature", 0.6)
                    .put("maxOutputTokens", 400);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    url,
                    new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers),
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String text = root.path("candidates").get(0)
                        .path("content").path("parts").get(0)
                        .path("text").asText("");
                if (!text.isBlank()) return text.trim();
            }
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 429) {
                // Parse retry-after from the error body
                int retrySeconds = parseRetrySeconds(e.getResponseBodyAsString());
                retryAfter = Instant.now().plusSeconds(retrySeconds);
                log.warn("Gemini 429 — backing off for {}s (model: {}). Switching to smart fallback.", retrySeconds, geminiModel);
            } else {
                log.error("Gemini API error {}: {}", e.getStatusCode(), e.getMessage());
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
        }
        return smartFallback(question, alerts, news);
    }

    private String buildPrompt(String question, List<AlertResponse> alerts, List<NewsArticle> news) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are 'Pune Pulse AI', a helpful city assistant for Pune, India. ");
        sb.append("Use the provided context to answer in 2-4 sentences. Be specific, cite areas and sources. No markdown.\n\n");

        if (!alerts.isEmpty()) {
            sb.append("Pune alerts:\n");
            alerts.forEach(a -> sb.append(String.format("- [%s/%s] %s: %s\n",
                    a.getCategory(), a.getAreaTag(), a.getTitle(), truncate(a.getSummary(), 120))));
            sb.append("\n");
        }

        if (news != null && !news.isEmpty()) {
            sb.append("Latest news:\n");
            news.forEach(n -> sb.append(String.format("- [%s] %s (%s)\n",
                    n.getCategory(), truncate(n.getTitle(), 100), n.getSource())));
            sb.append("\n");
        }

        sb.append("Question: ").append(question);
        return sb.toString();
    }

    /**
     * Rule-based smart fallback that uses real news + alerts to compose a useful answer
     * without calling the LLM. Used when Gemini is rate-limited.
     */
    private String smartFallback(String question, List<AlertResponse> alerts, List<NewsArticle> news) {
        String lowerQ = question.toLowerCase();
        StringBuilder sb = new StringBuilder();

        boolean hasNews = news != null && !news.isEmpty();
        boolean hasAlerts = !alerts.isEmpty();

        // News-first: answer directly from scraped headlines when they are available
        if (hasNews || hasAlerts) {
            sb.append("Here's what I found for Pune right now:\n\n");

            if (hasNews) {
                int shown = 0;
                for (NewsArticle n : news) {
                    if (shown >= 4) break;
                    String areaHint = n.getArea() != null ? " (" + n.getArea() + ")" : "";
                    sb.append("• ").append(n.getTitle()).append(areaHint)
                      .append(" — ").append(n.getSource()).append("\n");
                    shown++;
                }
            }

            if (hasAlerts) {
                if (hasNews) sb.append("\nRelated city alerts:\n");
                for (AlertResponse a : alerts) {
                    sb.append("• [").append(a.getCategory()).append("] ")
                      .append(a.getTitle()).append(" in ").append(a.getAreaTag()).append("\n");
                }
            }

            // Append a contextual hint based on the question topic
            if (containsAny(lowerQ, "traffic", "road", "jam", "commute")) {
                sb.append("\nTip: Check My Alerts or Traffic Map tab for live hotspots.");
            } else if (containsAny(lowerQ, "news", "latest", "today", "update")) {
                sb.append("\nTip: Switch to the Live News tab on the Dashboard for more headlines.");
            }
            return sb.toString().trim();
        }

        // Generic helpful response when nothing is available
        return "I don't have specific updates matching your query right now. "
                + "Try asking about traffic, power cuts, water supply, or events in areas like "
                + "Hinjewadi, Kothrud, Baner, or Koregaon Park. "
                + "You can also check the Live News and Traffic Map tabs on the Dashboard.";
    }

    private int parseRetrySeconds(String errorBody) {
        try {
            // "retryDelay": "53s"  or  "Please retry in 53.2s"
            JsonNode root = objectMapper.readTree(errorBody);
            JsonNode details = root.path("error").path("details");
            if (details.isArray()) {
                for (JsonNode d : details) {
                    JsonNode delay = d.path("retryDelay");
                    if (!delay.isMissingNode()) {
                        String val = delay.asText().replace("s", "").trim();
                        return (int) Math.ceil(Double.parseDouble(val)) + 5;
                    }
                }
            }
        } catch (Exception ignored) {}
        return 65; // safe default: back off 65 seconds
    }

    private String buildCacheKey(String question, AlertCategory category, String area) {
        return question + "|" + category + "|" + area;
    }

    private String getCached(String key) {
        CacheEntry entry = responseCache.get(key);
        if (entry != null && Instant.now().isBefore(entry.expiry())) {
            return entry.answer();
        }
        responseCache.remove(key);
        return null;
    }

    private void putCache(String key, String answer) {
        responseCache.put(key, new CacheEntry(answer,
                Instant.now().plusSeconds(cacheTtlMinutes * 60L)));
        // Evict old entries to prevent unbounded growth
        if (responseCache.size() > 200) {
            Instant now = Instant.now();
            responseCache.entrySet().removeIf(e -> now.isAfter(e.getValue().expiry()));
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }

    private AlertCategory detectCategory(String question) {
        if (containsAny(question, "traffic", "road", "jam", "accident", "signal", "commute", "expressway")) return AlertCategory.TRAFFIC;
        if (containsAny(question, "power", "electricity", "light", "load shedding", "outage", "blackout")) return AlertCategory.POWER;
        if (containsAny(question, "water", "supply", "tanker", "pipeline", "dam")) return AlertCategory.WATER;
        if (containsAny(question, "event", "festival", "concert", "rally", "match", "marathon")) return AlertCategory.EVENT;
        return null;
    }

    private String detectArea(String question) {
        return List.of("hinjewadi", "kothrud", "baner", "viman nagar", "hadapsar",
                "koregaon park", "shivajinagar", "deccan", "aundh", "wakad",
                "pimpri", "chinchwad", "katraj", "swargate", "magarpatta",
                "kalyani nagar", "camp", "bibwewadi", "warje", "karve nagar")
                .stream().filter(question::contains).findFirst().orElse(null);
    }

    private boolean containsAny(String text, String... keywords) {
        return Arrays.stream(keywords).anyMatch(text::contains);
    }

    private record CacheEntry(String answer, Instant expiry) {}
}
