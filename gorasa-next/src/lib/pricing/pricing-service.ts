import { createClient } from "@supabase/supabase-js";
import type { PricingContext, PricingResult, PromoValidation, CorporateDiscount } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

let rulesCache: any[] | null = null;
let rulesCacheTime = 0;
const CACHE_TTL_MS = 60_000;

async function getActiveRules(): Promise<any[]> {
  const now = Date.now();
  if (rulesCache && now - rulesCacheTime < CACHE_TTL_MS) {
    return rulesCache;
  }

  const { data, error } = await supabase
    .from("PricingRule")
    .select("*")
    .eq("isActive", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Failed to fetch pricing rules:", error);
    return rulesCache || [];
  }

  rulesCache = data || [];
  rulesCacheTime = now;
  return rulesCache;
}

function matchesRule(rule: any, ctx: PricingContext): boolean {
  if (rule.category !== "ALL" && rule.category !== ctx.category) return false;
  if (rule.destination && rule.destination !== ctx.destination) return false;
  if (rule.hotelName && rule.hotelName !== ctx.hotelName) return false;
  if (rule.airlineCode && rule.airlineCode !== ctx.airlineCode) return false;
  if (rule.roomType && rule.roomType !== ctx.roomType) return false;

  const now = new Date();
  if (rule.validFrom && new Date(rule.validFrom) > now) return false;
  if (rule.validTo && new Date(rule.validTo) < now) return false;

  return true;
}

const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  SGD: 0.016,
};

export async function calculatePrice(
  baseRate: number,
  context: PricingContext,
  currency: string = "INR"
): Promise<PricingResult> {
  const rules = await getActiveRules();

  let applicableRule: any = null;
  for (const rule of rules) {
    if (matchesRule(rule, context)) {
      applicableRule = rule;
      break;
    }
  }

  let markupAmount = 0;
  let appliedRuleName: string | null = null;

  if (applicableRule) {
    appliedRuleName = applicableRule.name;
    if (applicableRule.markupType === "FLAT") {
      markupAmount = applicableRule.markupValue;
    } else {
      markupAmount = Math.round(baseRate * (applicableRule.markupValue / 100));
    }

    if (applicableRule.minPrice != null) {
      const minTotal = applicableRule.minPrice;
      if (baseRate + markupAmount < minTotal) {
        markupAmount = Math.max(0, minTotal - baseRate);
      }
    }
    if (applicableRule.maxPrice != null) {
      const maxTotal = applicableRule.maxPrice;
      if (baseRate + markupAmount > maxTotal) {
        markupAmount = Math.max(0, maxTotal - baseRate);
      }
    }
  }

  const displayedPrice = Math.round(baseRate + markupAmount);
  const originalPrice = Math.round(displayedPrice * 1.25);

  if (currency !== "INR") {
    const rate = EXCHANGE_RATES[currency] || 1;
    return {
      baseRate: Math.round(baseRate * rate * 100) / 100,
      markupAmount: Math.round(markupAmount * rate * 100) / 100,
      displayedPrice: Math.round(displayedPrice * rate * 100) / 100,
      originalPrice: Math.round(originalPrice * rate * 100) / 100,
      appliedRuleName,
      currency,
    };
  }

  return {
    baseRate,
    markupAmount,
    displayedPrice,
    originalPrice,
    appliedRuleName,
    currency,
  };
}

export async function validatePromoCode(
  code: string,
  bookingAmount: number,
  category: string,
  userId: string
): Promise<PromoValidation> {
  const { data: promo, error } = await supabase
    .from("PromoCode")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("isActive", true)
    .single();

  if (error || !promo) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Invalid promo code" };
  }

  if (promo.validTo && new Date(promo.validTo) < new Date()) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Promo code expired" };
  }

  if (promo.validFrom && new Date(promo.validFrom) > new Date()) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Promo code not yet active" };
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { valid: false, discountAmount: 0, finalPrice: bookingAmount, error: "Promo code usage limit reached" };
  }

  if (promo.minBookingValue && bookingAmount < promo.minBookingValue) {
    return {
      valid: false,
      discountAmount: 0,
      finalPrice: bookingAmount,
      error: `Minimum booking of ₹${promo.minBookingValue} required`,
    };
  }

  if (promo.applicableTo && promo.applicableTo !== "ALL" && promo.applicableTo !== category) {
    return {
      valid: false,
      discountAmount: 0,
      finalPrice: bookingAmount,
      error: "Promo code not applicable for this booking type",
    };
  }

  if (promo.isFirstBooking) {
    const { count } = await supabase
      .from("Booking")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);
    if (count && count > 0) {
      return {
        valid: false,
        discountAmount: 0,
        finalPrice: bookingAmount,
        error: "Promo code valid for first booking only",
      };
    }
  }

  let discount = 0;
  if (promo.type === "flat" || promo.discountType === "FLAT") {
    discount = promo.discountValue;
  } else {
    discount = Math.round(bookingAmount * (promo.discountValue / 100));
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  }

  discount = Math.min(discount, bookingAmount);

  await supabase
    .from("PromoCode")
    .update({ usedCount: (promo.usedCount || 0) + 1 })
    .eq("id", promo.id);

  return {
    valid: true,
    discountAmount: discount,
    finalPrice: Math.max(0, bookingAmount - discount),
  };
}

export async function getCorporateDiscount(
  companyId: string,
  category: string,
  destination: string | undefined,
  bookingAmount: number
): Promise<CorporateDiscount> {
  if (!companyId) {
    return { discountAmount: 0, finalPrice: bookingAmount, ruleName: null };
  }

  const { data: rates, error } = await supabase
    .from("CorporateRate")
    .select("*")
    .eq("companyId", companyId)
    .eq("isActive", true)
    .order("discountValue", { ascending: false });

  if (error || !rates || rates.length === 0) {
    return { discountAmount: 0, finalPrice: bookingAmount, ruleName: null };
  }

  let bestRate: any = null;
  for (const rate of rates) {
    if (rate.category !== "ALL" && rate.category !== category) continue;
    if (rate.destination && rate.destination !== destination) continue;
    bestRate = rate;
    break;
  }

  if (!bestRate) {
    return { discountAmount: 0, finalPrice: bookingAmount, ruleName: null };
  }

  let discount = 0;
  if (bestRate.discountType === "FLAT") {
    discount = bestRate.discountValue;
  } else {
    discount = Math.round(bookingAmount * (bestRate.discountValue / 100));
    if (bestRate.maxDiscount) {
      discount = Math.min(discount, bestRate.maxDiscount);
    }
  }

  discount = Math.min(discount, bookingAmount);

  return {
    discountAmount: discount,
    finalPrice: Math.max(0, bookingAmount - discount),
    ruleName: `Corporate: ${bestRate.discountType === "FLAT" ? `₹${bestRate.discountValue}` : `${bestRate.discountValue}%`}`,
  };
}

export function calculateTax(subtotal: number, category: "HOTEL" | "FLIGHT" | "PACKAGE"): number {
  if (category === "FLIGHT") {
    return Math.round(subtotal * 0.18);
  }
  return Math.round(subtotal * 0.05);
}

export function getTaxRate(category: "HOTEL" | "FLIGHT" | "PACKAGE"): number {
  if (category === "FLIGHT") return 18;
  return 5;
}

export function invalidateRulesCache(): void {
  rulesCache = null;
  rulesCacheTime = 0;
}
