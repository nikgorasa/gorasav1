import { createClient } from "@supabase/supabase-js";
import { PAYMENT_CONFIG } from "./config";
import * as razorpay from "./razorpay-client";
import * as phonepe from "./phonepe-client";
import type { CheckoutResponse, WebhookResult, PaymentStatus, RefundResult } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function createCheckout(params: {
  bookingId: string;
  amount: number;
  gateway: "razorpay" | "phonepe";
  userEmail: string;
}): Promise<CheckoutResponse> {
  const { data: booking, error: bookingError } = await supabase
    .from("Booking")
    .select("*")
    .eq("id", params.bookingId)
    .single();

  if (bookingError || !booking) {
    throw new Error("Booking not found");
  }

  const { data: existingPayment } = await supabase
    .from("Payment")
    .select("*")
    .eq("bookingId", params.bookingId)
    .single();

  if (existingPayment && existingPayment.status === "COMPLETED") {
    throw new Error("Payment already completed");
  }

  if (existingPayment) {
    await supabase.from("Payment").delete().eq("id", existingPayment.id);
  }

  const { data: payment, error: paymentError } = await supabase
    .from("Payment")
    .insert({
      bookingId: params.bookingId,
      amount: params.amount,
      method: params.gateway,
      status: "PENDING",
      gateway: params.gateway,
    })
    .select()
    .single();

  if (paymentError) {
    throw new Error("Failed to create payment record");
  }

  let checkoutUrl: string;
  let orderId: string;

  if (params.gateway === "phonepe") {
    const redirectUrl = `${PAYMENT_CONFIG.appUrl}/payment/success?bookingId=${params.bookingId}`;
    const callbackUrl = `${PAYMENT_CONFIG.appUrl}/api/webhooks/phonepe`;
    const result = await phonepe.createPayment({
      amount: params.amount,
      transactionId: payment.id,
      redirectUrl,
      callbackUrl,
    });
    checkoutUrl = result.paymentLink;
    orderId = result.transactionId;
  } else {
    const result = await razorpay.createOrder({
      amount: params.amount,
      receipt: params.bookingId,
    });
    checkoutUrl = result.checkoutUrl;
    orderId = result.id;
  }

  await supabase
    .from("Payment")
    .update({ orderId })
    .eq("id", payment.id);

  return { checkoutUrl, orderId };
}

export async function handleRazorpayWebhook(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  rawBody: string;
}): Promise<WebhookResult> {
  if (!PAYMENT_CONFIG.mock) {
    const valid = razorpay.verifySignature(params.rawBody, params.signature);
    if (!valid) {
      throw new Error("Invalid Razorpay signature");
    }
  }

  const { data: payment } = await supabase
    .from("Payment")
    .select("*")
    .eq("orderId", params.orderId)
    .single();

  if (!payment) {
    throw new Error("Payment not found for order: " + params.orderId);
  }

  await supabase
    .from("Payment")
    .update({
      status: "COMPLETED",
      paymentId: params.paymentId,
      signature: params.signature,
    })
    .eq("id", payment.id);

  await supabase
    .from("Booking")
    .update({
      paymentStatus: "COMPLETED",
      status: "CONFIRMED",
      confirmedAt: new Date().toISOString(),
    })
    .eq("id", payment.bookingId);

  return { success: true, bookingId: payment.bookingId, paymentId: params.paymentId };
}

export async function handlePhonePeWebhook(params: {
  transactionId: string;
  state: string;
  payload: any;
}): Promise<WebhookResult> {
  const { data: payment } = await supabase
    .from("Payment")
    .select("*")
    .eq("id", params.transactionId)
    .single();

  if (!payment) {
    throw new Error("Payment not found: " + params.transactionId);
  }

  if (params.state === "COMPLETED") {
    await supabase
      .from("Payment")
      .update({
        status: "COMPLETED",
        paymentId: params.transactionId,
        metadata: params.payload,
      })
      .eq("id", payment.id);

    await supabase
      .from("Booking")
      .update({
        paymentStatus: "COMPLETED",
        status: "CONFIRMED",
        confirmedAt: new Date().toISOString(),
      })
      .eq("id", payment.bookingId);

    return { success: true, bookingId: payment.bookingId };
  }

  await supabase
    .from("Payment")
    .update({
      status: "FAILED",
      failureReason: `PhonePe state: ${params.state}`,
    })
    .eq("id", payment.id);

  await supabase
    .from("Booking")
    .update({ paymentStatus: "FAILED" })
    .eq("id", payment.bookingId);

  return { success: false, bookingId: payment.bookingId };
}

export async function getPaymentStatus(bookingId: string): Promise<PaymentStatus> {
  const { data: payment } = await supabase
    .from("Payment")
    .select("*")
    .eq("bookingId", bookingId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  if (!payment) {
    return { status: "PENDING", amount: 0, gateway: "razorpay", createdAt: "" };
  }

  return {
    status: payment.status,
    amount: payment.amount,
    gateway: payment.gateway,
    paymentId: payment.paymentId,
    createdAt: payment.createdAt,
  };
}

export async function processRefund(
  paymentId: string,
  amount?: number
): Promise<RefundResult> {
  const { data: payment } = await supabase
    .from("Payment")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "COMPLETED") {
    throw new Error("Can only refund completed payments");
  }

  const refund = await razorpay.createRefund(payment.paymentId, amount);

  await supabase
    .from("Payment")
    .update({
      status: "REFUNDED",
      refundedAt: new Date().toISOString(),
      refundAmount: amount || payment.amount,
    })
    .eq("id", paymentId);

  await supabase
    .from("Booking")
    .update({ paymentStatus: "REFUNDED" })
    .eq("id", payment.bookingId);

  return { success: true, refundId: refund.id, amount: amount || payment.amount };
}
