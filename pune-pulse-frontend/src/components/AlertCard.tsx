import { useState, useRef, useEffect } from "react";
import type { Alert } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  AlertTriangle,
  Zap,
  Droplets,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Clock,
  Tag,
  BarChart2,
} from "lucide-react";

const CATEGORY_CONFIG = {
  TRAFFIC: {
    icon: AlertTriangle,
    label: "Traffic",
    accent: "#f97316",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
    iconColor: "text-orange-500",
    glow: "rgba(249,115,22,0.12)",
    barColor: "#f97316",
    badgeBg: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
  },
  POWER: {
    icon: Zap,
    label: "Power",
    accent: "#eab308",
    iconBg: "bg-yellow-500/10 dark:bg-yellow-500/15",
    iconColor: "text-yellow-500",
    glow: "rgba(234,179,8,0.12)",
    barColor: "#eab308",
    badgeBg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  },
  WATER: {
    icon: Droplets,
    label: "Water",
    accent: "#3b82f6",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    iconColor: "text-blue-500",
    glow: "rgba(59,130,246,0.12)",
    barColor: "#3b82f6",
    badgeBg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  EVENT: {
    icon: Calendar,
    label: "Event",
    accent: "#8b5cf6",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
    iconColor: "text-violet-500",
    glow: "rgba(139,92,246,0.12)",
    barColor: "#8b5cf6",
    badgeBg: "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400",
  },
};

const scoreLabel = (s: number) =>
  s >= 80 ? { text: "High confidence", color: "#22c55e" } :
  s >= 60 ? { text: "Moderate", color: "#eab308" } :
             { text: "Low confidence", color: "#ef4444" };

interface Props {
  alert: Alert;
  compact?: boolean;
}

export default function AlertCard({ alert, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = CATEGORY_CONFIG[alert.category];
  const Icon = cfg.icon;
  const timeAgo = getTimeAgo(alert.timestamp);
  const score = scoreLabel(alert.confidenceScore);
  const barRef = useRef<HTMLDivElement>(null);

  // Animate confidence bar fill with GSAP when card expands
  useEffect(() => {
    if (!expanded || !barRef.current) return;
    gsap.fromTo(
      barRef.current,
      { width: "0%" },
      {
        width: `${alert.confidenceScore}%`,
        duration: 0.75,
        ease: "power2.out",
        delay: 0.12,
      }
    );
  }, [expanded, alert.confidenceScore]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -2,
        boxShadow: `0 8px 32px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.06)`,
      }}
      style={{ borderLeftColor: cfg.accent }}
      className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-l-[3px] overflow-hidden cursor-pointer select-none"
      onClick={() => !compact && setExpanded((x) => !x)}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {/* Icon */}
        <div className={`p-2.5 rounded-xl ${cfg.iconBg} shrink-0`}>
          <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
        </div>

        {/* Main text */}
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}>
              {cfg.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              <Tag className="h-2.5 w-2.5" />
              {alert.areaTag}
            </span>
            {alert.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-2.5 w-2.5" />
                Verified
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
            {alert.title}
          </h3>

          {/* Compact preview of summary */}
          {!expanded && !compact && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {alert.summary}
            </p>
          )}
        </div>

        {/* Right meta */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: score.color }}
          >
            {alert.confidenceScore}%
          </span>
          {!compact && (
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Thin accent underline beneath header */}
      <div
        className="mx-4 h-px opacity-20"
        style={{ background: `linear-gradient(to right, ${cfg.accent}, transparent)` }}
      />

      {/* Expandable detail panel */}
      <AnimatePresence initial={false}>
        {expanded && !compact && (
          <motion.div
            key="details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-4 space-y-3">
              {/* Summary */}
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {alert.summary}
              </p>

              {/* Confidence bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <BarChart2 className="h-3 w-3" />
                    Confidence
                  </span>
                  <span className="text-xs font-semibold" style={{ color: score.color }}>
                    {score.text}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    ref={barRef}
                    className="h-full rounded-full"
                    style={{
                      width: 0,
                      background: `linear-gradient(to right, ${cfg.accent}99, ${cfg.accent})`,
                    }}
                  />
                </div>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(alert.timestamp).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {alert.sourceUrl && (
                  <a
                    href={alert.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View source
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getTimeAgo(timestamp: string): string {
  const diffMin = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}