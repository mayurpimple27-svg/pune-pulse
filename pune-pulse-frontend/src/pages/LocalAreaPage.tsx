import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MapPin,
  Cpu,
  Landmark,
  Building2,
  TreePine,
  Castle,
  Sparkles,
  Signal,
} from "lucide-react";
import { getNews } from "../api/client";
import { getAreaBySlug, type AreaVibe } from "../config/puneAreas";
import type { NewsArticle } from "../types";

/* ── vibe-specific decorations ─────────────────────────────────── */

const VIBE_BG: Record<AreaVibe, string> = {
  tech: "bg-gradient-to-br from-gray-950 via-slate-900 to-cyan-950",
  traditional:
    "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-amber-950/30 dark:to-gray-950",
  urban:
    "bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-gray-950 dark:via-violet-950/30 dark:to-gray-950",
  green:
    "bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-950 dark:via-green-950/30 dark:to-gray-950",
  heritage:
    "bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 dark:from-gray-950 dark:via-rose-950/30 dark:to-gray-950",
};

const VIBE_HERO_OVERLAY: Record<AreaVibe, string> = {
  tech: "from-cyan-900/90 via-slate-900/80 to-transparent",
  traditional: "from-amber-900/85 via-orange-900/70 to-transparent",
  urban: "from-violet-900/85 via-purple-900/70 to-transparent",
  green: "from-green-900/85 via-emerald-900/70 to-transparent",
  heritage: "from-rose-900/85 via-orange-900/70 to-transparent",
};

const VIBE_ICON: Record<AreaVibe, typeof Cpu> = {
  tech: Cpu,
  traditional: Landmark,
  urban: Building2,
  green: TreePine,
  heritage: Castle,
};

const VIBE_CARD_ACCENT: Record<AreaVibe, string> = {
  tech: "border-l-cyan-500",
  traditional: "border-l-amber-500",
  urban: "border-l-violet-500",
  green: "border-l-emerald-500",
  heritage: "border-l-rose-500",
};

const VIBE_BADGE: Record<AreaVibe, string> = {
  tech: "bg-cyan-500/10 text-cyan-400",
  traditional: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  urban: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  heritage: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

/* ── page ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 8;

export default function LocalAreaPage() {
  const { slug } = useParams<{ slug: string }>();
  const area = getAreaBySlug(slug ?? "");

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [displayed, setDisplayed] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.from(heroRef.current.querySelectorAll("[data-anim]"), {
      y: 16,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.15,
    });
  }, [slug]);

  useEffect(() => {
    if (!area) return;
    setLoading(true);
    getNews({ limit: 50 })
      .then((res) => {
        const all: NewsArticle[] = res.data.data;
        // Filter by area name (case-insensitive match)
        const local = all.filter(
          (a) =>
            a.area?.toLowerCase() === area.name.toLowerCase() ||
            a.title.toLowerCase().includes(area.name.toLowerCase()) ||
            a.summary?.toLowerCase().includes(area.name.toLowerCase()),
        );
        // If few matches, pad with general articles
        const results =
          local.length >= 4
            ? local
            : [...local, ...all.filter((a) => !local.includes(a))].slice(0, 20);
        setNews(results);
        setDisplayed(results.slice(0, PAGE_SIZE));
        setHasMore(results.length > PAGE_SIZE);
      })
      .catch(() => {
        setNews([]);
        setDisplayed([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const loadMore = () => {
    const next = news.slice(displayed.length, displayed.length + PAGE_SIZE);
    setDisplayed((prev) => [...prev, ...next]);
    setHasMore(displayed.length + next.length < news.length);
  };

  if (!area) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <MapPin className="h-10 w-10 mb-3 opacity-40" />
        <p className="font-medium">Area not found</p>
        <Link to="/" className="text-sm text-indigo-500 mt-2 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const VibeIcon = VIBE_ICON[area.vibe];
  const isTech = area.vibe === "tech";

  return (
    <div
      className={`-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 min-h-screen ${VIBE_BG[area.vibe]} pb-12`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Hero banner ────────────────────────────────── */}
        <div
          ref={heroRef}
          className="relative rounded-b-3xl overflow-hidden h-60 sm:h-72 mb-6"
        >
          <img
            src={area.image}
            alt={area.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${VIBE_HERO_OVERLAY[area.vibe]}`}
          />

          {/* Decorative grid for tech vibe */}
          {isTech && (
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          )}

          {/* Decorative rangoli dots for traditional / heritage */}
          {(area.vibe === "traditional" || area.vibe === "heritage") && (
            <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
              {[...Array(3)].map((_, r) => (
                <div key={r} className="flex gap-2 mb-2">
                  {[...Array(3)].map((_, c) => (
                    <div
                      key={c}
                      className="w-2 h-2 rounded-full bg-amber-300"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-5 left-5 z-10">
            <Link
              to="/"
              data-anim
              className="inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white/90 mb-2 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Dashboard
            </Link>
            <div data-anim className="flex items-center gap-2 mb-1">
              <VibeIcon className={`h-4 w-4 ${area.accentColor}`} />
              <span
                className={`text-[10px] font-semibold uppercase tracking-widest ${isTech ? "text-cyan-400/80" : "text-white/55"}`}
              >
                {area.tagline}
              </span>
            </div>
            <h1
              data-anim
              className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none"
            >
              {area.name}
            </h1>
            <p
              data-anim
              className="text-sm text-white/50 mt-1 max-w-md leading-snug"
            >
              {area.description}
            </p>
          </div>

          {/* Pulse badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
            <Signal className={`h-3 w-3 ${area.accentColor}`} />
            <span className="text-[10px] font-medium text-white/70 tracking-wider">
              LOCAL PULSE
            </span>
          </div>
        </div>

        {/* ── Feature chips ──────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6 px-1">
          {area.features.map((f) => (
            <span
              key={f}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full border ${VIBE_BADGE[area.vibe]} border-current/10`}
            >
              <Sparkles className="h-3 w-3" />
              {f}
            </span>
          ))}
        </div>

        {/* ── Local news ─────────────────────────────────── */}
        <div className="px-1">
          <h2
            className={`text-sm font-bold mb-3 ${isTech ? "text-cyan-300" : "text-gray-900 dark:text-white"}`}
          >
            Local News & Updates
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className={`h-6 w-6 animate-spin ${area.accentColor}`} />
            </div>
          ) : displayed.length === 0 ? (
            <div
              className={`text-center py-16 ${isTech ? "text-slate-500" : "text-gray-400"}`}
            >
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No local news found for {area.name}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {displayed.map((article, i) => (
                  <motion.div
                    key={article.url + i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={`rounded-xl border-l-[3px] ${VIBE_CARD_ACCENT[area.vibe]} ${
                      isTech
                        ? "bg-slate-900/80 border border-slate-800"
                        : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                    } px-4 py-3 flex items-start gap-3 transition-colors hover:shadow-sm`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {article.area && (
                          <span
                            className={`badge text-[10px] !py-0 ${VIBE_BADGE[area.vibe]}`}
                          >
                            {article.area}
                          </span>
                        )}
                        <span
                          className={`text-[10px] ml-auto ${isTech ? "text-slate-500" : "text-gray-400 dark:text-gray-500"}`}
                        >
                          {article.published}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold text-sm leading-snug line-clamp-2 mb-1 ${isTech ? "text-white" : "text-gray-900 dark:text-white"}`}
                      >
                        {article.title}
                      </h3>
                      {article.summary && (
                        <p
                          className={`text-xs line-clamp-1 ${isTech ? "text-slate-400" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          {article.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <span
                          className={`text-[10px] truncate ${isTech ? "text-slate-500" : "text-gray-400 dark:text-gray-500"}`}
                        >
                          {article.source}
                        </span>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs flex items-center gap-0.5 shrink-0 ${area.accentColor} hover:opacity-80`}
                          >
                            <ExternalLink className="h-3 w-3" /> Read
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMore}
                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm ${
                      isTech
                        ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    Load more
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
