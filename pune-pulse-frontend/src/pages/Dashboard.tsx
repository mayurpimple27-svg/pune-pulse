import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const SLIDESHOW_IMAGES = [
  "/images/general-1.webp",
  "/images/general-2.webp",
  "/images/general-3-event-3.webp",
  "/images/general-4.webp",
  "/images/general-5.webp",
  "/images/event-1.webp",
  "/images/event-2.webp",
  "/images/event-4.webp",
  "/images/traffic-1.webp",
  "/images/traffic-2.webp",
];
import {
  getSubscriptions,
  getAreas,
  subscribe,
  unsubscribe,
} from "../api/client";
import { PUNE_AREAS } from "../config/puneAreas";
import {
  MapPin,
  Plus,
  X,
  Map,
  Newspaper,
  MessageCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.from(heroRef.current.querySelectorAll("[data-hero]"), {
      y: 18,
      opacity: 0,
      duration: 0.5,
      stagger: 0.09,
      ease: "power3.out",
      delay: 0.1,
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % SLIDESHOW_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, areasRes] = await Promise.all([
        getSubscriptions(),
        getAreas(),
      ]);
      setSubscriptions(subRes.data.data);
      setAllAreas(areasRes.data.data);
    } catch {
      // silently handle
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribe = async (area: string) => {
    await subscribe(area);
    setSubscriptions((prev) => [...prev, area]);
    fetchData();
  };

  const handleUnsubscribe = async (area: string) => {
    await unsubscribe(area);
    setSubscriptions((prev) => prev.filter((a) => a !== area));
    fetchData();
  };

  const availableAreas = allAreas.filter((a) => !subscriptions.includes(a));

  return (
    <div className="space-y-5">
      {/* ── Pune Slideshow Hero ── */}
      <div className="relative rounded-2xl overflow-hidden h-64 sm:h-72 border border-white/[0.06]">
        {/* Slides */}
        <AnimatePresence initial={false}>
          <motion.img
            key={slideIndex}
            src={SLIDESHOW_IMAGES[slideIndex]}
            alt="Pune city"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

        {/* Bottom text */}
        <div className="absolute bottom-5 left-5 z-10">
          <p className="text-white/55 text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5">
            Pune, Maharashtra
          </p>
          <h2 className="text-white text-2xl font-bold tracking-tight leading-none">
            City of Knowledge
          </h2>
          <p className="text-white/45 text-xs mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-4 h-px bg-white/30 rounded-full" />
            18.52°N · 73.85°E · Smart City Initiative
          </p>
        </div>

        {/* Live pill + refresh */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={fetchData}
            className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-white/80 border border-white/10 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </motion.button>
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-medium text-white/70 tracking-wider">
              LIVE
            </span>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1">
          {SLIDESHOW_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIndex(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === slideIndex
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Quick access cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            to: "/traffic",
            icon: Map,
            label: "Traffic Map",
            desc: "Live road conditions",
            accent:
              "from-rose-500/10 to-orange-500/10 dark:from-rose-500/[0.07] dark:to-orange-500/[0.07]",
            iconBg: "bg-rose-50 dark:bg-rose-500/10",
            iconColor: "text-rose-500",
          },
          {
            to: "/news",
            icon: Newspaper,
            label: "Live News",
            desc: "Latest Pune headlines",
            accent:
              "from-sky-500/10 to-cyan-500/10 dark:from-sky-500/[0.07] dark:to-cyan-500/[0.07]",
            iconBg: "bg-sky-50 dark:bg-sky-500/10",
            iconColor: "text-sky-500",
          },
          {
            to: "/chat",
            icon: MessageCircle,
            label: "Ask Pune AI",
            desc: "Chat with Gemini",
            accent:
              "from-violet-500/10 to-purple-500/10 dark:from-violet-500/[0.07] dark:to-purple-500/[0.07]",
            iconBg: "bg-violet-50 dark:bg-violet-500/10",
            iconColor: "text-violet-500",
          },
        ].map((card) => (
          <Link key={card.to} to={card.to}>
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`card group flex items-center gap-4 bg-gradient-to-br ${card.accent} hover:shadow-md transition-shadow`}
            >
              <div
                className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor} shrink-0`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {card.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {card.desc}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ── Subscribed Areas ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            <MapPin className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
            Subscribed Areas
          </h2>
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {subscriptions.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {subscriptions.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              No subscriptions yet — add areas below.
            </p>
          )}
          <AnimatePresence>
            {subscriptions.map((area) => (
              <motion.span
                key={area}
                layout
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
              >
                {area}
                <button
                  onClick={() => handleUnsubscribe(area)}
                  className="hover:text-red-500 transition-colors ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {availableAreas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
            {availableAreas.map((area) => (
              <button
                key={area}
                onClick={() => handleSubscribe(area)}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Plus className="h-3 w-3" />
                {area}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Inside Pune ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
            Inside Pune
          </h2>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            · Explore neighbourhoods
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PUNE_AREAS.map((area) => (
            <motion.div
              key={area.slug}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/area/${area.slug}`)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group h-32 sm:h-40 shadow-sm"
            >
              {/* gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-3">
                <area.icon className={`h-3.5 w-3.5 ${area.accentColor} mb-1`} />
                <p className="text-white font-bold text-sm leading-tight line-clamp-1">
                  {area.name}
                </p>
                <p
                  className={`text-[10px] leading-tight mt-0.5 truncate ${area.accentColor} opacity-90`}
                >
                  {area.tagline}
                </p>
              </div>

              {/* hover arrow */}
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
