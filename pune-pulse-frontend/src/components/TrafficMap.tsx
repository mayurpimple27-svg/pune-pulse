import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { getTrafficHotspots } from "../api/client";
import type { TrafficHotspot } from "../types";
import {
  MapPin,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Navigation,
  X,
} from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

const SEVERITY_COLORS = {
  HIGH: {
    bg: "#ef4444",
    pulse: "#fca5a5",
    text: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  },
  MEDIUM: {
    bg: "#f59e0b",
    pulse: "#fcd34d",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  },
  LOW: {
    bg: "#22c55e",
    pulse: "#86efac",
    text: "text-green-600 dark:text-green-400",
    badge:
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  },
};

export default function TrafficMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatLayerRef = useRef<any>(null);
  const roadLayersRef = useRef<any[]>([]);
  const [hotspots, setHotspots] = useState<TrafficHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TrafficHotspot | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current.children, {
        y: -15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });
    }
  }, []);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const res = await getTrafficHotspots();
      setHotspots(res.data.data);
    } catch {
      setHotspots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  // Load Leaflet dynamically
  useEffect(() => {
    if (window.L?.heatLayer) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const heatScript = document.createElement("script");
      heatScript.src =
        "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
      heatScript.onload = () => initMap();
      document.head.appendChild(heatScript);
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [18.5204, 73.8567], // Pune center
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    mapInstance.current = map;
    updateMarkers();
  };

  // Initialize map after Leaflet loads
  useEffect(() => {
    if (window.L?.heatLayer && !mapInstance.current && mapRef.current) {
      initMap();
    }
  }, [loading]);

  // Update markers + road overlay when hotspots change
  useEffect(() => {
    updateMarkers();
    void fetchRoadOverlay(hotspots);
  }, [hotspots]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMarkers = () => {
    if (!mapInstance.current || !window.L) return;
    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Rebuild heat density overlay
    updateHeatmap();

    hotspots.forEach((spot) => {
      const colors = SEVERITY_COLORS[spot.severity];
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 32px; height: 32px;
          background: ${colors.bg};
          border: 2px solid rgba(255,255,255,0.9);
          border-radius: 50%;
          box-shadow: 0 0 12px ${colors.bg}, 0 0 28px ${colors.bg}99;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          animation: markerPulse 2s ease-in-out infinite;
        "><div style="width: 9px; height: 9px; background: white; border-radius: 50%;"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon })
        .addTo(mapInstance.current)
        .on("click", () => setSelected(spot));

      marker.bindTooltip(
        `<strong>${spot.area}</strong><br/>${spot.severity} severity`,
        { direction: "top", offset: [0, -16] },
      );

      markersRef.current.push(marker);
    });
  };

  const updateHeatmap = () => {
    if (!mapInstance.current || !window.L?.heatLayer) return;
    const L = window.L;

    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }

    if (hotspots.length === 0) return;

    const heatData = hotspots.map((spot) => {
      const intensity =
        spot.severity === "HIGH" ? 1.0 : spot.severity === "MEDIUM" ? 0.6 : 0.3;
      return [spot.lat, spot.lng, intensity];
    });

    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 75,
      blur: 50,
      maxZoom: 17,
      gradient: {
        0.3: "#22c55e",
        0.5: "#eab308",
        0.7: "#f97316",
        1.0: "#ef4444",
      },
    }).addTo(mapInstance.current);
  };

  /**
   * Fetches real road geometries from Overpass API for each hotspot and
   * renders them as coloured polylines with a glow, so roads light up
   * in red / amber / green according to traffic density.
   */
  const fetchRoadOverlay = async (spots: TrafficHotspot[]) => {
    if (!mapInstance.current || !window.L || spots.length === 0) return;
    const L = window.L;

    // Clear stale road layers
    roadLayersRef.current.forEach((l) => l.remove());
    roadLayersRef.current = [];

    await Promise.all(
      spots.map(async (spot) => {
        try {
          const query =
            `[out:json][timeout:8];` +
            `(way(around:450,${spot.lat},${spot.lng})` +
            `["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"];);` +
            `out geom;`;

          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
            signal: controller.signal,
          });
          clearTimeout(timer);
          if (!res.ok) return;

          const data = await res.json();
          const { bg: color } = SEVERITY_COLORS[spot.severity];
          const weight =
            spot.severity === "HIGH" ? 7 : spot.severity === "MEDIUM" ? 5 : 3;
          const opacity =
            spot.severity === "HIGH"
              ? 0.88
              : spot.severity === "MEDIUM"
                ? 0.65
                : 0.5;

          (data.elements ?? []).forEach((el: any) => {
            if (el.type === "way" && Array.isArray(el.geometry)) {
              const pts = el.geometry.map((n: any) => [n.lat, n.lon]);

              // Wide, translucent glow behind the solid line
              roadLayersRef.current.push(
                L.polyline(pts, {
                  color,
                  weight: weight + 10,
                  opacity: 0.18,
                  lineCap: "round",
                }).addTo(mapInstance.current),
              );

              // Solid colour road line
              roadLayersRef.current.push(
                L.polyline(pts, {
                  color,
                  weight,
                  opacity,
                  lineCap: "round",
                  lineJoin: "round",
                }).addTo(mapInstance.current),
              );
            }
          });
        } catch {
          // Network timeout or parse error — skip gracefully
        }
      }),
    );
  };

  const flyTo = (spot: TrafficHotspot) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([spot.lat, spot.lng], 15, { duration: 1.2 });
    }
    setSelected(spot);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Navigation className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Pune Traffic Map
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live traffic hotspots across the city
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={fetchHotspots}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </motion.button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(["HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
          <div key={sev} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: SEVERITY_COLORS[sev].bg }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {sev}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden" style={{ height: "480px" }}>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                <Loader2 className="h-8 w-8 text-pulse-600 animate-spin" />
              </div>
            )}
            <div ref={mapRef} className="h-full w-full" />
          </div>
        </div>

        {/* Hotspot list */}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence>
            {hotspots.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-400"
              >
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No traffic hotspots detected</p>
              </motion.div>
            )}
            {hotspots.map((spot, i) => {
              const colors = SEVERITY_COLORS[spot.severity];
              return (
                <motion.div
                  key={spot.area}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => flyTo(spot)}
                  className={`card cursor-pointer hover:shadow-md transition-all border-l-4 ${
                    selected?.area === spot.area
                      ? "ring-2 ring-pulse-500 shadow-md"
                      : ""
                  }`}
                  style={{ borderLeftColor: colors.bg }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={`h-4 w-4 shrink-0 ${colors.text}`}
                        />
                        <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {spot.area}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {spot.description}
                      </p>
                    </div>
                    <span className={`badge shrink-0 ${colors.badge}`}>
                      {spot.severity}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected detail popup */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="card border-l-4"
            style={{ borderLeftColor: SEVERITY_COLORS[selected.severity].bg }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle
                    className={`h-5 w-5 ${SEVERITY_COLORS[selected.severity].text}`}
                  />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {selected.area}
                  </h3>
                  <span
                    className={`badge ${SEVERITY_COLORS[selected.severity].badge}`}
                  >
                    {selected.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selected.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Coordinates: {selected.lat.toFixed(4)},{" "}
                  {selected.lng.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for marker animation + dark map overrides */}
      <style>{`
        @keyframes markerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .leaflet-container {
          font-family: inherit;
          border-radius: 0.75rem;
          background: #111827;
        }
        .leaflet-control-attribution {
          background: rgba(17,24,39,0.85) !important;
          color: #6b7280 !important;
        }
        .leaflet-control-attribution a { color: #9ca3af !important; }
        .leaflet-control-zoom a {
          background: #1f2937 !important;
          color: #e5e7eb !important;
          border-color: #374151 !important;
        }
        .leaflet-control-zoom a:hover { background: #374151 !important; }
        .leaflet-tooltip {
          background: #1f2937 !important;
          color: #f9fafb !important;
          border: 1px solid #374151 !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
        }
        .leaflet-tooltip::before { border-top-color: #374151 !important; }
        .leaflet-popup-content-wrapper {
          background: #1f2937 !important;
          color: #f9fafb !important;
          border: 1px solid #374151 !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6) !important;
        }
        .leaflet-popup-tip { background: #1f2937 !important; }
      `}</style>
    </div>
  );
}
