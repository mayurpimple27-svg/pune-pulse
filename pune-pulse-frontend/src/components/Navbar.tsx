import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import NotificationPanel from "./NotificationPanel";
import {
  LayoutDashboard,
  Radio,
  MessageCircle,
  Map,
  Newspaper,
  LogIn,
  LogOut,
  UserPlus,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logoRef.current) {
      gsap.from(logoRef.current, {
        x: -24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    ...(user ? [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }] : []),
    { to: "/feed", icon: Radio, label: "Feed" },
    { to: "/traffic", icon: Map, label: "Traffic" },
    { to: "/news", icon: Newspaper, label: "News" },
    ...(user ? [{ to: "/chat", icon: MessageCircle, label: "Ask Pune" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-saffron-200/30 dark:border-gray-800/60 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ─ Logo ─ */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div ref={logoRef} className="flex items-center gap-2.5">
              {/* Saffron-accented logo mark */}
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center shadow-md shadow-saffron-400/25 group-hover:scale-105 transition-transform">
                <span
                  className="text-white font-bold text-lg leading-none"
                  style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                >
                  प
                </span>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-[1.05rem] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                  Pune<span className="text-saffron-500">Pulse</span>
                </span>
                <span className="text-[0.6rem] text-gray-400 dark:text-gray-500 tracking-widest uppercase leading-none">
                  पुण्यनगरी
                </span>
              </div>
            </div>
          </Link>

          {/* ─ Desktop nav links ─ */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? "text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-400/10"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {isActive(to) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-saffron-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* ─ Right actions ─ */}
          <div className="flex items-center gap-2">
            <NotificationPanel />

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auth */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2.5 ml-1">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pulse-500 to-pulse-700 flex items-center justify-center text-white text-xs font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-saffron-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-4 py-1.5 rounded-lg bg-saffron-500 text-white hover:bg-saffron-600 transition-colors font-medium flex items-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─ Mobile slide-down ─ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? "text-saffron-600 bg-saffron-50 dark:bg-saffron-400/10 dark:text-saffron-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    className="btn-secondary flex-1 text-center text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center text-sm px-4 py-2 rounded-lg bg-saffron-500 text-white font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
