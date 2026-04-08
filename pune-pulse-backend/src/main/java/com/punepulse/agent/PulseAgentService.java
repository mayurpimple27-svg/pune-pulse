package com.punepulse.agent;

import com.punepulse.entity.Alert;
import com.punepulse.entity.AlertCategory;
import com.punepulse.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;

/**
 * The Agentic AI brain: fetches, analyzes, and persists alerts.
 * Currently uses realistic mock data for Pune. In production, this would
 * scrape r/pune, PMC bulletins, and traffic APIs, then pass through an LLM
 * for classification and confidence scoring.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PulseAgentService implements CommandLineRunner {

    private final AlertRepository alertRepository;
    private final Random random = new Random();

    private static final List<String> AREAS = List.of(
            "Hinjewadi", "Kothrud", "Baner", "Viman Nagar", "Hadapsar",
            "Koregaon Park", "Shivajinagar", "Deccan", "Aundh", "Wakad",
            "Pimpri", "Chinchwad", "Katraj", "Swargate", "Magarpatta",
            "Kalyani Nagar", "Camp", "Bibwewadi", "Warje", "Karve Nagar"
    );

    private static final List<MockAlertTemplate> TEMPLATES = List.of(
            // TRAFFIC alerts
            new MockAlertTemplate(AlertCategory.TRAFFIC,
                    "Heavy congestion on Mumbai-Pune Expressway near %s",
                    "Expect 45-60 min delays due to multi-vehicle incident. PCMC traffic police deployed. Alternate routes via NH48 recommended.",
                    "https://reddit.com/r/pune/traffic_update"),
            new MockAlertTemplate(AlertCategory.TRAFFIC,
                    "Road closure at %s junction for metro construction",
                    "Phase 3 metro line construction requires full road closure from 10 PM to 6 AM. Light vehicles diverted via service road.",
                    "https://pmc.gov.in/metro-updates"),
            new MockAlertTemplate(AlertCategory.TRAFFIC,
                    "Signal malfunction reported at %s Square",
                    "Multiple signals non-functional since morning. Manual traffic control in place. Commuters advised to use alternate routes.",
                    "https://punetraffic.gov.in/alerts"),
            new MockAlertTemplate(AlertCategory.TRAFFIC,
                    "Waterlogging causing traffic snarls in %s",
                    "Heavy overnight rain has caused waterlogging on main roads. Several buses diverted. PCMC pumps deployed for drainage.",
                    "https://reddit.com/r/pune/monsoon"),

            // POWER alerts
            new MockAlertTemplate(AlertCategory.POWER,
                    "Scheduled power outage in %s sector",
                    "MSEDCL maintenance work: power supply will be interrupted from 9 AM to 5 PM. Backup generators recommended for critical systems.",
                    "https://msedcl.in/outage-schedule"),
            new MockAlertTemplate(AlertCategory.POWER,
                    "Transformer failure causes blackout in parts of %s",
                    "Unplanned outage affecting 2000+ households. MSEDCL repair crew dispatched. Estimated restoration: 4-6 hours.",
                    "https://msedcl.in/complaints"),
            new MockAlertTemplate(AlertCategory.POWER,
                    "Load shedding announced for %s area",
                    "Due to peak summer demand, 2-hour rolling load shedding scheduled between 2 PM and 6 PM in residential zones.",
                    "https://msedcl.in/load-shedding"),

            // WATER alerts
            new MockAlertTemplate(AlertCategory.WATER,
                    "Water supply disruption in %s due to pipeline repair",
                    "PMC water department undertaking emergency repair of 900mm main pipeline. Water tankers arranged. Supply expected to resume by evening.",
                    "https://pmc.gov.in/water-supply"),
            new MockAlertTemplate(AlertCategory.WATER,
                    "Low water pressure reported across %s ward",
                    "Khadakwasla dam water levels below seasonal average. Residents advised to store water. Tanker requests being processed.",
                    "https://pmc.gov.in/dam-levels"),
            new MockAlertTemplate(AlertCategory.WATER,
                    "Contamination alert: Boil water advisory for %s",
                    "PMC has issued a boil water advisory following detection of elevated turbidity in supply lines. Testing underway.",
                    "https://pmc.gov.in/water-quality"),

            // EVENT alerts
            new MockAlertTemplate(AlertCategory.EVENT,
                    "Ganesh Visarjan procession routes through %s",
                    "Major immersion processions expected. Road closures from 4 PM. Heavy police deployment. Public parking available at designated grounds.",
                    "https://pmc.gov.in/ganesh-festival"),
            new MockAlertTemplate(AlertCategory.EVENT,
                    "IT companies hosting tech meetup at %s Hub",
                    "Free weekend hackathon and tech talks. Registration open. Expected footfall: 500+. Parking limited, use metro.",
                    "https://reddit.com/r/pune/events"),
            new MockAlertTemplate(AlertCategory.EVENT,
                    "Pune Marathon route passes through %s",
                    "Annual Pune International Marathon this Sunday. Road closures from 5 AM to 12 PM. 15,000 registered runners expected.",
                    "https://punemarathon.com"),
            new MockAlertTemplate(AlertCategory.EVENT,
                    "PMC tree plantation drive at %s park",
                    "Citizens invited to participate in green drive. Saplings provided free. 8 AM to 11 AM. Refreshments available.",
                    "https://pmc.gov.in/green-pune")
    );

    @Override
    public void run(String... args) {
        if (alertRepository.count() == 0) {
            log.info("Seeding initial alert data...");
            seedAlerts(30);
            log.info("Seeded {} initial alerts", 30);
        }
    }

    /**
     * Simulates the agentic loop: Fetch → Analyze → Persist.
     * Runs every 30 minutes. In production, this would:
     * 1. FETCH: Scrape Reddit r/pune, PMC RSS, traffic APIs
     * 2. ANALYZE: Send raw text to LLM for extraction, categorization, confidence scoring
     * 3. PERSIST: Save structured Alert entities
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void agentLoop() {
        log.info("[PulseAgent] Running fetch-analyze-persist cycle...");

        // Simulate fetching 1-3 new alerts per cycle
        int count = random.nextInt(3) + 1;
        seedAlerts(count);

        log.info("[PulseAgent] Persisted {} new alerts", count);
    }

    private void seedAlerts(int count) {
        for (int i = 0; i < count; i++) {
            MockAlertTemplate template = TEMPLATES.get(random.nextInt(TEMPLATES.size()));
            String area = AREAS.get(random.nextInt(AREAS.size()));

            Alert alert = Alert.builder()
                    .title(String.format(template.titleTemplate(), area))
                    .summary(template.summary())
                    .category(template.category())
                    .sourceUrl(template.sourceUrl())
                    .confidenceScore(random.nextInt(40) + 60) // 60-99
                    .areaTag(area)
                    .isVerified(random.nextBoolean())
                    .timestamp(Instant.now().minus(random.nextInt(720), ChronoUnit.MINUTES))
                    .build();

            alertRepository.save(alert);
        }
    }

    private record MockAlertTemplate(AlertCategory category, String titleTemplate,
                                     String summary, String sourceUrl) {
    }
}
