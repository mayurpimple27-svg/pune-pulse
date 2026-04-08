import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAlerts, getAreas } from "../api/client";
import type { Alert, AlertCategory } from "../types";
import AlertCard from "../components/AlertCard";
import { Filter, Loader2, Radio } from "lucide-react";

const CATEGORIES: { label: string; value: AlertCategory | "" }[] = [
  { label: "All", value: "" },
  { label: "Traffic", value: "TRAFFIC" },
  { label: "Power", value: "POWER" },
  { label: "Water", value: "WATER" },
  { label: "Events", value: "EVENT" },
];

export default function Feed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<AlertCategory | "">("");
  const [areaTag, setAreaTag] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getAreas()
      .then((res) => setAreas(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getAlerts({
      page,
      size: 20,
      category: category || undefined,
      areaTag: areaTag || undefined,
    })
      .then((res) => {
        setAlerts(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, category, areaTag]);

  const resetFilters = () => {
    setCategory("");
    setAreaTag("");
    setPage(0);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Radio className="h-6 w-6 text-pulse-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Intelligence Feed
        </h1>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters
          </span>
          {(category || areaTag) && (
            <button
              onClick={resetFilters}
              className="text-xs text-pulse-600 dark:text-pulse-400 hover:underline ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setCategory(c.value);
                  setPage(0);
                }}
                className={`badge py-1.5 px-3 cursor-pointer transition-colors ${
                  category === c.value
                    ? "bg-pulse-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <select
            value={areaTag}
            onChange={(e) => {
              setAreaTag(e.target.value);
              setPage(0);
            }}
            className="input-field sm:w-48"
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-pulse-600 animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <p className="text-lg">No alerts found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <AlertCard alert={alert} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary text-sm"
          >
            Previous
          </button>
          <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
