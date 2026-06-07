"use client";

import React from "react";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-slate-900 mb-6">User Management</h1>
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Users size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Users</h2>
        <p className="text-slate-500">
          Manage users, roles, and permissions
        </p>
        <p className="text-slate-400 text-sm mt-4">Coming soon</p>
      </div>
    </div>
  );
}
