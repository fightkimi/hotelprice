import type { AlertableRateSnapshot, RateSnapshot } from './types';

const STALE_AFTER_MS = 36 * 60 * 60 * 1000;

export function isAlertableSnapshot(snapshot: RateSnapshot): snapshot is AlertableRateSnapshot {
  return snapshot.availabilityStatus === 'available' && typeof snapshot.priceCents === 'number' && snapshot.priceCents > 0;
}

export function markStaleSnapshots(snapshots: RateSnapshot[], nowIso: string): RateSnapshot[] {
  const nowMs = Date.parse(nowIso);
  return snapshots.map((snapshot) => {
    const capturedMs = Date.parse(snapshot.capturedAt);
    if (Number.isNaN(nowMs) || Number.isNaN(capturedMs) || nowMs - capturedMs <= STALE_AFTER_MS) {
      return snapshot;
    }

    return {
      ...snapshot,
      availabilityStatus: 'stale',
      unavailableReason: 'captured_at_older_than_36h',
      priceCents: null
    };
  });
}
