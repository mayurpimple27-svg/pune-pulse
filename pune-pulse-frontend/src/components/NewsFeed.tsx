import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { getNews } from "../api/client";
import type { NewsArticle } from "../types";
import {
  Newspaper,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Zap,
  Droplets,
  Calendar,
  Globe,
} from "lucide-react";
// ─── Module-level cache (survives route changes) ───────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const newsCache = new Map<
  string,
  { articles: NewsArticle[]; fetchedAt: number }
>();

const CATEGORY_ICONS: Record<string, any> = {
  TRAFFIC: AlertTriangle,
  POWER: Zap,
  WATER: Droplets,
  EVENT: Calendar,
  GENERAL: Globe,
};

const CATEGORY_STYLES: Record<string, string> = {
  TRAFFIC:
    "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  POWER:
    "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  WATER: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  EVENT:
    "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  GENERAL: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

const FILTERS = ["ALL", "TRAFFIC", "POWER", "WATER", "EVENT", "GENERAL"];

const PAGE_SIZE = 10;

export default function NewsFeed() {
  const [displayed, setDisplayed] = useState<NewsArticle[]>([]);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [lastFetched, setLastFetched] = useState<number | null>(null);
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

  const fetchNews = async (force = false) => {
    const cached = newsCache.get(filter);
    const now = Date.now();

    // Serve from cache if fresh and not a forced refresh
    if (!force && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      setDisplayed(cached.articles.slice(0, PAGE_SIZE));
      setOffset(PAGE_SIZE);
      setHasMore(cached.articles.length > PAGE_SIZE);
      setLastFetched(cached.fetchedAt);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: { category?: string; limit: number } = { limit: 50 };
      if (filter !== "ALL") params.category = filter;
      const res = await getNews(params);
      const data: NewsArticle[] = res.data.data;
      newsCache.set(filter, { articles: data, fetchedAt: Date.now() });
      setDisplayed(data.slice(0, PAGE_SIZE));
      setOffset(PAGE_SIZE);
      setHasMore(data.length > PAGE_SIZE);
      setLastFetched(Date.now());
    } catch {
      setDisplayed([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const cached = newsCache.get(filter);
    if (!cached) return;
    const next = cached.articles.slice(offset, offset + PAGE_SIZE);
    if (next.length === 0) return;
    setLoadingMore(true);
    // Append — existing cards are NOT replaced, React only creates new nodes
    setDisplayed((prev) => [...prev, ...next]);
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setHasMore(newOffset < cached.articles.length);
    setLoadingMore(false);
  };

  useEffect(() => {
    setDisplayed([]);
    setOffset(PAGE_SIZE);
    setHasMore(false);
    fetchNews();
  }, [filter]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = Date.now();
      const diff = Math.floor((now - d.getTime()) / 60000);
      if (diff < 1) return "Just now";
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return `${Math.floor(diff / 1440)}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div ref={headerRef} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pulse-100 dark:bg-pulse-900/30 rounded-xl">
            <Newspaper className="h-5 w-5 text-pulse-600 dark:text-pulse-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Latest Pune News
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lastFetched
                ? `Updated ${formatDate(new Date(lastFetched).toISOString())} · cached for 5 min`
                : "Scraped from real news sources in real-time"}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => fetchNews(true)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </motion.button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`badge py-1.5 px-3 cursor-pointer transition-colors ${
              filter === f
                ? "bg-pulse-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 text-pulse-600 animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-400"
        >
          <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No news articles found</p>
          <p className="text-sm mt-1">The scraper service may be starting up</p>
        </motion.div>
      ) : (
        <>
          <div className="space-y-2">
            {displayed.map((article, i) => {
              const Icon = CATEGORY_ICONS[article.category] || Globe;
              const badgeStyle =
                CATEGORY_STYLES[article.category] || CATEGORY_STYLES.GENERAL;
              return (
                <motion.div
                  key={article.url + i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex items-start gap-3 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${badgeStyle.split(" text-")[0]}`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${badgeStyle.split(" ").find((c) => c.startsWith("text-"))}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`badge ${badgeStyle} text-[10px] !py-0`}>
                        {article.category.charAt(0) +
                          article.category.slice(1).toLowerCase()}
                      </span>
                      {article.area && (
                        <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] !py-0">
                          {article.area}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
                        {formatDate(article.published)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                        {article.source}
                      </span>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pulse-600 dark:text-pulse-400 hover:text-pulse-700 flex items-center gap-0.5 shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" /> Read
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {displayed.length} articles
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={loadingMore}
                onClick={loadMore}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pulse-600 hover:bg-pulse-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Load more
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
