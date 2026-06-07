"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function LeadsPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">Lead CRM</h1>
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Lead Pipeline</h2>
        <p className="text-slate-500">
          Pipeline view with stages: New → Qualified → Meeting → Proposal → Negotiation → Won → Lost
        </p>
        <p className="text-slate-400 text-sm mt-4">Coming soon</p>
      </div>
    </div>
  );
}
