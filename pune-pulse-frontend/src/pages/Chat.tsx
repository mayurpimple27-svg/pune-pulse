import { useState, useRef, useEffect } from "react";
import { askPune } from "../api/client";
import type { ChatResponse } from "../types";
import AlertCard from "../components/AlertCard";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  relatedAlerts?: ChatResponse["relatedAlerts"];
  id: number;
}

const SUGGESTIONS = [
  "What's the latest news in Pune?",
  "What's the traffic in Hinjewadi right now?",
  "Any power cuts in Kothrud today?",
  "Water supply update for Baner?",
  "Events happening in Koregaon Park?",
  "Give me today's Pune news headlines",
];

let msgIdCounter = 0;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgIdCounter++,
      role: "assistant",
      content:
        "Hi! I'm the Pune Pulse AI â€” powered by Gemini. Ask me about traffic, power outages, water supply, or events in any Pune area.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // GSAP header animation on mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: msgIdCounter++, role: "user", content: question },
    ]);
    setLoading(true);

    try {
      const res = await askPune(question);
      const data = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdCounter++,
          role: "assistant" as const,
          content: data.answer,
          relatedAlerts: data.relatedAlerts,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdCounter++,
          role: "assistant" as const,
          content: "Sorry, I had trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div ref={headerRef} className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-pulse-600 rounded-xl">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ask Pune AI
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Powered by Gemini Â· Real-time city intelligence
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-pulse-500 to-pulse-700 flex items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[78%] ${msg.role === "user" ? "order-first" : ""}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.role === "user"
                      ? "bg-pulse-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.relatedAlerts && msg.relatedAlerts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-3 space-y-2"
                  >
                    {msg.relatedAlerts.map((alert) => (
                      <AlertCard key={alert.id} alert={alert} compact />
                    ))}
                  </motion.div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-pulse-500 to-pulse-700 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-md px-5 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-pulse-500"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.15,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions â€” only when no messages besides welcome */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-3"
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-pulse-200 dark:border-pulse-800 text-pulse-700 dark:text-pulse-300 hover:bg-pulse-50 dark:hover:bg-pulse-900/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Pune â€” traffic, power, water, events..."
            className="input-field flex-1"
            disabled={loading}
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileTap={{ scale: 0.92 }}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </motion.button>
        </form>
      </div>
    </div>
  );
}
