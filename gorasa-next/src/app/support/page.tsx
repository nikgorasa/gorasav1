"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Bot, User, Volume2, VolumeX, Phone, ExternalLink } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

async function getAIResponse(query: string, categories: { id: string; label: string; keywords: string }[]): Promise<string> {
  const lower = query.toLowerCase();
  let matchedId = "default";
  for (const cat of categories) {
    const kws: string[] = JSON.parse(cat.keywords || "[]");
    if (kws.some((k) => lower.includes(k))) { matchedId = cat.id; break; }
  }
  try {
    const res = await fetch(`/api/faq?keyword=${matchedId}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0].answer;
  } catch {}
  return "I'm the GoRASA AI Concierge! I can help you with flights, hotels, packages, and more. What would you like to know?";
}

export default function SupportPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Welcome to GoRASA AI Support! 🌴 I'm here to help you with flights, hotels, packages, and more. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [faqCategories, setFaqCategories] = useState<{ id: string; label: string; keywords: string }[]>([]);
  const [siteConfig, setSiteConfig] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    Promise.all([
      fetch("/api/faq/categories").then(r => r.json()),
      fetch("/api/site-config").then(r => r.json()),
    ]).then(([cats, config]) => {
      if (Array.isArray(cats)) setFaqCategories(cats);
      if (config && !config.error) setSiteConfig(config);
    }).catch(() => {});
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const response = await getAIResponse(text, faqCategories);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""));
      utterance.lang = "en-IN";
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
      setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      <main className="min-h-screen pt-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-saffron flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">AI Support Desk</h1>
                <p className="text-sm text-slate-500">Powered by GoRASA Concierge</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Chat Area */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col" style={{ height: "500px" }}>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-start gap-2 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.sender === "user" ? "bg-brand-saffron" : "bg-slate-900"
                          }`}>
                            {msg.sender === "user" ? (
                              <User size={16} className="text-white" />
                            ) : (
                              <Bot size={16} className="text-white" />
                            )}
                          </div>
                          <div className={`rounded-2xl px-4 py-3 ${
                            msg.sender === "user"
                              ? "bg-brand-saffron text-white"
                              : "bg-slate-100 text-slate-900"
                          }`}>
                            <p className="text-sm whitespace-pre-line">{msg.text}</p>
                            {msg.sender === "ai" && (
                              <button
                                onClick={() => speaking ? stopSpeaking() : speakText(msg.text)}
                                className="mt-2 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                              >
                                {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                {speaking ? "Stop" : "Hear response"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                          <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-slate-100 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Replies */}
                  <div className="px-4 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto">
                    {faqCategories.map((qr) => (
                      <button
                        key={qr.id}
                        onClick={() => sendMessage(qr.label)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-slate-200">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage(input);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-saffron outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="px-4 py-2.5 bg-brand-saffron text-white rounded-xl hover:bg-brand-burnt transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">WhatsApp Support</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Chat with us directly on WhatsApp for instant support.
                  </p>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp_number || "+919528500383"}?text=Hi%20GoRASA%2C%20I%20need%20help`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <Phone size={16} />
                    Open WhatsApp
                    <ExternalLink size={12} className="ml-auto" />
                  </a>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Contact Info</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>📞 {siteConfig.contact_phone || "+91 95285 00383"}</p>
                    <p>📧 {siteConfig.contact_email || "rasatravelindia@gmail.com"}</p>
                    <p>🏢 RASA Travel Services India Pvt Ltd</p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Premium Support</h3>
                  <p className="text-xs text-slate-500">
                    Platinum members get priority support with dedicated concierge.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
