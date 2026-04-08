import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import NewsFeed from "../components/NewsFeed";
import { Newspaper } from "lucide-react";

export default function NewsPage() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current.children, {
        y: -16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div ref={headerRef} className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 dark:from-blue-500/10 dark:to-cyan-500/10"
        >
          <Newspaper className="h-5 w-5 text-blue-500" />
        </motion.div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Pune Live News
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Latest headlines scraped from Pune news sources
          </p>
        </div>
      </div>

      <NewsFeed />
    </div>
  );
}
