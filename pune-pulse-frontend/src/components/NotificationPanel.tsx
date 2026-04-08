import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { getTrafficHotspots } from "../api/client";
import type { TrafficHotspot } from "../types";
import { Bell, AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

const SEVERITY_STYLES = {
  HIGH: {
    border: "border-l-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  MEDIUM: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  LOW: {
    border: "border-l-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    badge:
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    dot: "bg-green-500",
  },
};

export default function NotificationPanel() {
  const [hotspots, setHotspots] = useState<TrafficHotspot[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getTrafficHotspots()
      .then((res) => setHotspots(res.data.data))
      .catch(() => {});
  }, []);

  const highCount = hotspots.filter((h) => h.severity === "HIGH").length;

  // Animate bell icon when there are HIGH alerts
  useEffect(() => {
    if (bellRef.current && highCount > 0) {
      gsap.fromTo(
        bellRef.current,
        { rotation: -10 },
        {
          rotation: 10,
          duration: 0.15,
          repeat: 5,
          yoyo: true,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(bellRef.current, { rotation: 0 });
          },
        },
      );
    }
  }, [highCount]);

  return (
    <div className="relative">
      {/* Bell trigger */}
      <motion.button
        ref={bellRef}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Traffic notifications"
      >
        <Bell className="h-4 w-4" />
        {highCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold"
          >
            {highCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute right-0 top-12 z-50 w-80 card shadow-xl border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    Traffic Alerts
                  </h3>
                  <span className="badge bg-pulse-100 dark:bg-pulse-900/40 text-pulse-700 dark:text-pulse-300">
                    {hotspots.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-y-auto space-y-1.5 scrollbar-thin"
                  >
                    {hotspots.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                        No active traffic alerts
                      </p>
                    ) : (
                      hotspots
                        .sort((a, b) => {
                          const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
                          return order[a.severity] - order[b.severity];
                        })
                        .map((spot, i) => {
                          const styles = SEVERITY_STYLES[spot.severity];
                          return (
                            <motion.div
                              key={spot.area}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={`rounded-lg p-3 border-l-4 ${styles.border} ${styles.bg}`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`h-2 w-2 rounded-full ${styles.dot} animate-pulse`}
                                  />
                                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                                    {spot.area}
                                  </span>
                                </div>
                                <span
                                  className={`badge text-[10px] ${styles.badge}`}
                                >
                                  {spot.severity}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {spot.description}
                              </p>
                            </motion.div>
                          );
                        })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
