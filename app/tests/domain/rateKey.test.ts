import { describe, expect, it } from 'vitest';
import { comparableRateKeyId, marketGroupKey, movementGroupKey } from '../../src/domain/pricing';
import type { ComparableRateKey, RateSnapshot } from '../../src/domain/pricing';

const baseKey: ComparableRateKey = {
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
};

function snapshot(snapshotId: string, hotelId: string): RateSnapshot {
  return {
    snapshotId,
    hotelId,
    ownerPropertyId: 'owner-westlake',
    competitorGroupId: 'core-westlake',
    capturedAt: '2026-05-19T08:00:00.000Z',
    sourceKind: 'fixture',
    availabilityStatus: 'available',
    unavailableReason: null,
    priceCents: 42800,
    rateKey: baseKey
  };
}

describe('comparable rate keys', () => {
  it('serializes every comparable dimension into a stable id', () => {
    expect(comparableRateKeyId(baseKey)).toBe(
      'ctrip_fixture|ctrip-demo|2026-06-01|2026-06-02|CNY|2|std-king|double-breakfast|free-cancel-24h|included'
    );
  });

  it('isolates movement by hotel id plus comparable rate key', () => {
    expect(movementGroupKey(snapshot('s1', 'comp-a'))).toBe(
      'comp-a::ctrip_fixture|ctrip-demo|2026-06-01|2026-06-02|CNY|2|std-king|double-breakfast|free-cancel-24h|included'
    );
    expect(movementGroupKey(snapshot('s1', 'comp-a'))).not.toBe(movementGroupKey(snapshot('s2', 'comp-b')));
  });

  it('groups market math by owner property, competitor group, and comparable key', () => {
    expect(marketGroupKey(snapshot('s1', 'comp-a'))).toBe(
      'owner-westlake::core-westlake::ctrip_fixture|ctrip-demo|2026-06-01|2026-06-02|CNY|2|std-king|double-breakfast|free-cancel-24h|included'
    );
  });
});
