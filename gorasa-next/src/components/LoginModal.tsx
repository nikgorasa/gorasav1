"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { X, Mail, Lock, User } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_USERS = [
  { email: "hmittal@gorasa.in", name: "Harsh Mittal", role: "SUPER_ADMIN", label: "Super Admin", color: "bg-orange-500" },
  { email: "admin@gorasa.in", name: "Priya Sharma", role: "ADMIN", label: "Admin", color: "bg-blue-500" },
  { email: "sales@gorasa.in", name: "Rahul Verma", role: "SALES", label: "Sales", color: "bg-green-500" },
  { email: "neha@corp.in", name: "Neha Gupta", role: "CORPORATE_USER", label: "Corporate", color: "bg-purple-500" },
  { email: "amit@example.com", name: "Amit Patel", role: "CUSTOMER", label: "Customer", color: "bg-slate-500" },
  { email: "priya@example.com", name: "Priya Singh", role: "CUSTOMER", label: "Customer", color: "bg-slate-500" },
];

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await signUpWithEmail(email, password, name);
        setError("Registration successful! Please check your email to verify your account.");
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmail(demoEmail, "demo123");
      onClose();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
          className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 border border-slate-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <span className="text-brand-saffron font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">
              GoRASA Gateway
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mt-3 mb-2">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 text-sm">
              {isRegistering
                ? "Create your GoRASA account to start exploring luxury travel."
                : "Sign in to unlock live pricing, corporate wallets, and premium loyalty."}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl font-semibold text-slate-700 transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegistering && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-saffron focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-saffron focus:border-transparent outline-none transition-all text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-saffron focus:border-transparent outline-none transition-all text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? "Loading..." : isRegistering ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle register/login */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-sm text-brand-saffron hover:text-brand-burnt font-medium cursor-pointer"
            >
              {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </button>
          </div>

          {/* Demo Users */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-3 text-center font-medium">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => handleDemoLogin(demo.email)}
                  disabled={loading}
                  className="relative py-2 px-2 border border-slate-200 hover:border-brand-saffron/30 hover:bg-orange-50/30 rounded-xl text-center transition-all cursor-pointer disabled:opacity-50 group"
                >
                  <div className={`w-1.5 h-1.5 ${demo.color} rounded-full mx-auto mb-1`} />
                  <div className="text-[10px] font-bold text-slate-700 leading-tight">
                    {demo.label}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">
                    {demo.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
