"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  BarChart3, Download, Filter, Calendar, TrendingUp, TrendingDown,
  CreditCard, Package, Plane, Building2, DollarSign, FileText
} from "lucide-react";
import { formatCurrency } from "@/lib";

interface BookingRow {
  id: string;
  type: string;
  itemName: string;
  providerOrAirline: string;
  price: number;
  originalPrice: number;
  discountApplied: number;
  couponCodeUsed: string;
  status: string;
  pnr: string;
  seatOrRoom: string;
  paxCount: number;
  travelDates: string;
  bookedAt: string;
  paymentStatus: string;
  leadGuestPan: string;
  userName: string;
  userEmail: string;
  paymentMethod: string;
  paymentGateway: string;
}

interface ReportData {
  bookings: BookingRow[];
  summary: {
    totalBookings: number;
    totalRevenue: number;
    totalOriginalPrice: number;
    totalDiscount: number;
    cancelledBookings: number;
    cancelledRevenue: number;
  };
  byType: { type: string; count: number; revenue: number; discount: number }[];
  paymentMethods: { method: string; count: number; total: number }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "cancellations" | "by-type">("overview");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.set("startDate", startDate);
        params.set("endDate", endDate);
      } else {
        params.set("period", period);
      }
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/reports?${params}`);
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  }, [period, typeFilter, startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const exportCSV = () => {
    if (!data) return;
    const headers = ["ID", "Type", "Item", "Provider", "Price", "Original Price", "Discount", "Promo Code", "Status", "PNR", "Pax", "Travel Dates", "Booked At", "Payment Status", "Customer", "Email", "Payment Method"];
    const rows = data.bookings.map((b) => [
      b.id, b.type, b.itemName, b.providerOrAirline, b.price, b.originalPrice || "", b.discountApplied || "", b.couponCodeUsed || "", b.status, b.pnr || "", b.paxCount, b.travelDates || "", new Date(b.bookedAt).toLocaleDateString("en-IN"), b.paymentStatus, b.userName, b.userEmail, b.paymentMethod
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-report-${period}-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("HOTEL")) return <Building2 size={16} className="text-blue-500" />;
    if (t.includes("FLIGHT")) return <Plane size={16} className="text-green-500" />;
    return <Package size={16} className="text-purple-500" />;
  };

  const getTypeColor = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("HOTEL")) return "bg-blue-50 text-blue-700 border-blue-100";
    if (t.includes("FLIGHT")) return "bg-green-50 text-green-700 border-green-100";
    return "bg-purple-50 text-purple-700 border-purple-100";
  };

  const s = data?.summary;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            Sales & Booking Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">Booking reports with price breakup, discounts, and payment tracking</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 cursor-pointer">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={period} onChange={(e) => { setPeriod(e.target.value); setStartDate(""); setEndDate(""); }} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">Quarterly (3M)</option>
              <option value="halfyearly">Half-Yearly (6M)</option>
              <option value="annual">Annual (YTD)</option>
            </select>
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
            <option value="all">All Types</option>
            <option value="HOTEL">Hotels</option>
            <option value="FLIGHT">Flights</option>
            <option value="PACKAGE">Packages</option>
          </select>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            <span className="text-slate-400">to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><TrendingUp size={20} className="text-blue-500" /></div>
                <p className="text-xs text-slate-500">Total Bookings</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s?.totalBookings || 0}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><DollarSign size={20} className="text-emerald-500" /></div>
                <p className="text-xs text-slate-500">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(s?.totalRevenue || 0)}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><CreditCard size={20} className="text-orange-500" /></div>
                <p className="text-xs text-slate-500">Total Discounts</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(s?.totalDiscount || 0)}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><TrendingDown size={20} className="text-red-500" /></div>
                <p className="text-xs text-slate-500">Cancellations</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{s?.cancelledBookings || 0}</p>
              <p className="text-xs text-slate-400">{formatCurrency(s?.cancelledRevenue || 0)}</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["overview", "bookings", "cancellations", "by-type"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${activeTab === tab ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                {tab === "overview" ? "Overview" : tab === "bookings" ? "All Bookings" : tab === "cancellations" ? "Cancellations" : "By Type"}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Type */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Revenue by Type</h3>
                <div className="space-y-3">
                  {data.byType.map((t) => (
                    <div key={t.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(t.type)}
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{t.type}</p>
                          <p className="text-xs text-slate-500">{t.count} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(t.revenue)}</p>
                        {t.discount > 0 && <p className="text-xs text-orange-500">-{formatCurrency(t.discount)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  {data.paymentMethods.map((p) => (
                    <div key={p.method} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard size={16} className="text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm capitalize">{p.method}</p>
                          <p className="text-xs text-slate-500">{p.count} transactions</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900">{formatCurrency(p.total)}</p>
                    </div>
                  ))}
                  {data.paymentMethods.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No payment data</p>
                  )}
                </div>
              </div>

              {/* Price Breakup Summary */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 lg:col-span-2">
                <h3 className="font-bold text-slate-900 mb-4">Price Breakup Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-500 mb-1">Gross Revenue</p>
                    <p className="font-bold text-slate-900">{formatCurrency(s?.totalOriginalPrice || s?.totalRevenue || 0)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-500 mb-1">Net Revenue</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(s?.totalRevenue || 0)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-500 mb-1">Discounts Given</p>
                    <p className="font-bold text-orange-600">{formatCurrency(s?.totalDiscount || 0)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-500 mb-1">Avg Booking Value</p>
                    <p className="font-bold text-slate-900">{formatCurrency((s?.totalRevenue || 0) / (s?.totalBookings || 1))}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-500 mb-1">Discount Rate</p>
                    <p className="font-bold text-orange-600">{s?.totalOriginalPrice ? ((s.totalDiscount / s.totalOriginalPrice) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Date</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Type</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Item</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Customer</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Original</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Discount</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Final Price</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Promo</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bookings.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{new Date(b.bookedAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getTypeColor(b.type)}`}>{b.type}</span></td>
                        <td className="px-4 py-3 text-slate-900 font-medium max-w-[200px] truncate">{b.itemName}</td>
                        <td className="px-4 py-3">
                          <p className="text-slate-900">{b.userName}</p>
                          <p className="text-xs text-slate-500">{b.userEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{b.originalPrice ? formatCurrency(b.originalPrice) : "—"}</td>
                        <td className="px-4 py-3 text-right text-orange-600">{b.discountApplied ? `-${formatCurrency(b.discountApplied)}` : "—"}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(b.price)}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-xs">{b.couponCodeUsed || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.status === "CONFIRMED" ? "bg-green-100 text-green-700" : b.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs capitalize">{b.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.bookings.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                  <p>No bookings found for this period</p>
                </div>
              )}
            </div>
          )}

          {/* Cancellations Tab */}
          {activeTab === "cancellations" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {data.bookings.filter((b) => b.status === "CANCELLED").length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <TrendingUp size={40} className="mx-auto mb-3 text-green-300" />
                  <p className="text-green-600 font-medium">No cancellations in this period</p>
                  <p className="text-sm mt-1">All {s?.totalBookings || 0} bookings are confirmed</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-100">
                        <th className="px-4 py-3 text-left font-bold text-red-700">Date</th>
                        <th className="px-4 py-3 text-left font-bold text-red-700">Type</th>
                        <th className="px-4 py-3 text-left font-bold text-red-700">Item</th>
                        <th className="px-4 py-3 text-left font-bold text-red-700">Customer</th>
                        <th className="px-4 py-3 text-right font-bold text-red-700">Amount</th>
                        <th className="px-4 py-3 text-left font-bold text-red-700">PNR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookings.filter((b) => b.status === "CANCELLED").map((b) => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-red-50">
                          <td className="px-4 py-3 text-slate-600">{new Date(b.bookedAt).toLocaleDateString("en-IN")}</td>
                          <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getTypeColor(b.type)}`}>{b.type}</span></td>
                          <td className="px-4 py-3 text-slate-900 font-medium">{b.itemName}</td>
                          <td className="px-4 py-3">{b.userName}</td>
                          <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(b.price)}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{b.pnr || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* By Type Tab */}
          {activeTab === "by-type" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.byType.map((t) => (
                <div key={t.type} className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    {getTypeIcon(t.type)}
                    <h3 className="font-bold text-slate-900">{t.type}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-slate-500">Bookings</span><span className="font-bold">{t.count}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-500">Revenue</span><span className="font-bold text-emerald-600">{formatCurrency(t.revenue)}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-500">Discounts</span><span className="font-bold text-orange-600">{formatCurrency(t.discount)}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-500">Net Revenue</span><span className="font-bold text-slate-900">{formatCurrency(t.revenue - t.discount)}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-500">Avg Value</span><span className="font-bold">{formatCurrency(t.revenue / (t.count || 1))}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
          <p>No data available</p>
        </div>
      )}
    </div>
  );
}
