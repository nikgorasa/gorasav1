"use client";

import React from "react";
import { Package } from "lucide-react";

export default function PackagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">Package CMS</h1>
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Package size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Package Management</h2>
        <p className="text-slate-500">
          Create and manage holiday packages with Tiptap rich text editor
        </p>
        <p className="text-slate-400 text-sm mt-4">Coming soon</p>
      </div>
    </div>
  );
}
