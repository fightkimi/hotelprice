import { describe, expect, it } from 'vitest';
import { isAlertableSnapshot, markStaleSnapshots } from '../../src/domain/pricing';
import type { RateSnapshot } from '../../src/domain/pricing';

const baseSnapshot: RateSnapshot = {
  snapshotId: 's1',
  hotelId: 'comp-a',
  ownerPropertyId: 'owner-westlake',
  competitorGroupId: 'core-westlake',
  capturedAt: '2026-05-19T08:00:00.000Z',
  sourceKind: 'fixture',
  availabilityStatus: 'available',
  unavailableReason: null,
  priceCents: 42800,
  rateKey: {
    channel: 'ctrip_fixture',
    sourceId: 'ctrip-demo',
    stayDate: '2026-06-01',
    checkoutDate: '2026-06-02',
    currency: 'CNY',
    occupancyAdults: 2,
    roomTypeKey: 'std-king',
    mealPlan: 'double-breakfast',
    cancellationPolicy: 'free-cancel-24h',
    taxFeeBasis: 'included'
  }
};

describe('availability rules', () => {
  it('allows available snapshots with a positive price', () => {
    expect(isAlertableSnapshot(baseSnapshot)).toBe(true);
  });

  it.each(['unavailable', 'no_rate', 'source_error', 'stale'] as const)('suppresses %s snapshots', (status) => {
    expect(isAlertableSnapshot({ ...baseSnapshot, availabilityStatus: status, priceCents: null })).toBe(false);
  });

  it('suppresses available snapshots without a positive price', () => {
    expect(isAlertableSnapshot({ ...baseSnapshot, priceCents: null })).toBe(false);
    expect(isAlertableSnapshot({ ...baseSnapshot, priceCents: 0 })).toBe(false);
  });

  it('marks snapshots stale when captured more than 36 hours before now', () => {
    const [stale] = markStaleSnapshots([baseSnapshot], '2026-05-21T00:01:00.000Z');
    expect(stale.availabilityStatus).toBe('stale');
    expect(stale.priceCents).toBeNull();
    expect(stale.unavailableReason).toBe('captured_at_older_than_36h');
  });

  it('keeps fresh snapshots alertable at exactly the 36 hour boundary', () => {
    const [fresh] = markStaleSnapshots([baseSnapshot], '2026-05-20T20:00:00.000Z');
    expect(fresh.availabilityStatus).toBe('available');
    expect(fresh.priceCents).toBe(42800);
  });
});
