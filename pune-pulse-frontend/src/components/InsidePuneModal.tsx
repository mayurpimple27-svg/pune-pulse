import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { PUNE_AREAS } from "../config/puneAreas";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InsidePuneModal({ open, onClose }: Props) {
  const navigate = useNavigate();

  const pick = (slug: string) => {
    onClose();
    navigate(`/area/${slug}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed inset-x-4 top-[8%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[82vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Inside Pune
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Tap a neighbourhood to explore its local pulse
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 scrollbar-thin">
              {PUNE_AREAS.map((area) => {
                const Icon = area.icon;
                return (
                  <motion.button
                    key={area.slug}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pick(area.slug)}
                    className={`group relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gradient-to-br ${area.gradient} text-left transition-shadow hover:shadow-lg`}
                  >
                    {/* Thumbnail */}
                    <img
                      src={area.image}
                      alt={area.name}
                      className="w-full h-24 object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`h-3 w-3 ${area.accentColor}`} />
                        <span className="text-xs font-bold text-white leading-none">
                          {area.name}
                        </span>
                      </div>
                      <p className="text-[9px] text-white/55 leading-tight line-clamp-1">
                        {area.tagline}
                      </p>
                    </div>

                    {/* Arrow on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-3.5 w-3.5 text-white/80" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
