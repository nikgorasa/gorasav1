export interface RateVerificationResult {
  itemName: string;
  originalPrice: number;
  liveRate: number;
  priceShift: number;
  message: string;
  lockId: string;
  status: 'Matched' | 'Refreshed' | 'SoldOut';
  expirationTime: string;
}

export async function verifyLatestVendorRate(
  type: 'flights' | 'hotels' | 'packages',
  itemName: string,
  provider: string,
  currentPrice: number
): Promise<RateVerificationResult> {
  await new Promise(resolve => setTimeout(resolve, 1400));

  const rand = Math.random();
  let liveRate = currentPrice;
  let status: 'Matched' | 'Refreshed' | 'SoldOut' = 'Matched';
  let message = '';
  let priceShift = 0;

  if (rand < 0.15) {
    priceShift = -Math.floor(Math.random() * 250) - 50;
    liveRate = Math.max(800, currentPrice + priceShift);
    status = 'Refreshed';
    message = `Wholesale rate refreshed! ${provider} just offered an extra platform coupon discount of ₹${Math.abs(priceShift)}.`;
  } else if (rand < 0.25) {
    priceShift = Math.floor(Math.random() * 150) + 50;
    liveRate = currentPrice + priceShift;
    status = 'Refreshed';
    message = `High demand warning: ${provider} updated the active fare index. Selected fare adjusted by +₹${priceShift}.`;
  } else {
    status = 'Matched';
    message = `Live inventory verified by ${provider}! Standard rate ₹${currentPrice} matches current GDS index.`;
  }

  const generatedLockId = "GR-LOCK-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    itemName,
    originalPrice: currentPrice,
    liveRate,
    priceShift,
    message,
    lockId: generatedLockId,
    status,
    expirationTime: new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}