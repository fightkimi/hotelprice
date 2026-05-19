import type { ComparableRateKey, RateSnapshot } from './types';

export function comparableRateKeyId(key: ComparableRateKey): string {
  return [
    key.channel,
    key.sourceId,
    key.stayDate,
    key.checkoutDate,
    key.currency,
    String(key.occupancyAdults),
    key.roomTypeKey,
    key.mealPlan,
    key.cancellationPolicy,
    key.taxFeeBasis
  ].join('|');
}

export function movementGroupKey(snapshot: RateSnapshot): string {
  return `${snapshot.hotelId}::${comparableRateKeyId(snapshot.rateKey)}`;
}

export function marketGroupKey(snapshot: RateSnapshot): string {
  return `${snapshot.ownerPropertyId}::${snapshot.competitorGroupId}::${comparableRateKeyId(snapshot.rateKey)}`;
}
