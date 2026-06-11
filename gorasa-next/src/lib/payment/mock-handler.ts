let mockOrderCounter = 0;

export function generateMockOrderId(): string {
  mockOrderCounter++;
  return `mock_order_${Date.now()}_${mockOrderCounter}`;
}

export function generateMockPaymentId(): string {
  return `mock_pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createMockWebhookPayload(orderId: string) {
  return {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: generateMockPaymentId(),
          order_id: orderId,
          amount: 0,
          status: "captured",
          method: "upi",
        },
      },
      order: {
        entity: {
          id: orderId,
          amount: 0,
          receipt: "",
        },
      },
    },
  };
}

export function getMockCheckoutUrl(orderId: string, appUrl: string): string {
  return `${appUrl}/payment/success?order_id=${orderId}&mock=true`;
}
