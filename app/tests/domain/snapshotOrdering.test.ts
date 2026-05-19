import { describe, expect, it } from 'vitest';
import { movementGroupKey, selectLatestPrevious } from '../../src/domain/pricing';
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

function snapshot(snapshotId: string, hotelId: string, capturedAt: string, priceCents = 42800): RateSnapshot {
  return {
    snapshotId,
    hotelId,
    ownerPropertyId: 'owner-westlake',
    competitorGroupId: 'core-westlake',
    capturedAt,
    sourceKind: 'fixture',
    availabilityStatus: 'available',
    unavailableReason: null,
    priceCents,
    rateKey: baseKey
  };
}

describe('snapshot ordering', () => {
  it('selects latest and previous within the same hotel and comparable key', () => {
    const s1 = snapshot('s1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000);
    const s2 = snapshot('s2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000);

    const groups = selectLatestPrevious([s2, s1]);

    expect(groups.get(movementGroupKey(s1))?.latest.snapshotId).toBe('s2');
    expect(groups.get(movementGroupKey(s1))?.previous?.snapshotId).toBe('s1');
  });

  it('does not share latest or previous state across hotels with the same comparable key', () => {
    const a1 = snapshot('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000);
    const a2 = snapshot('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000);
    const b1 = snapshot('b1', 'comp-b', '2026-05-19T12:00:00.000Z', 39000);

    const groups = selectLatestPrevious([a1, a2, b1]);

    expect(groups.get(movementGroupKey(a1))?.previous?.snapshotId).toBe('a1');
    expect(groups.get(movementGroupKey(b1))?.latest.snapshotId).toBe('b1');
    expect(groups.get(movementGroupKey(b1))?.previous).toBeNull();
  });

  it('keeps the lexicographically last snapshot id for duplicate capture times', () => {
    const older = snapshot('s1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000);
    const duplicateA = snapshot('s2-a', 'comp-a', '2026-05-19T12:00:00.000Z', 43000);
    const duplicateB = snapshot('s2-b', 'comp-a', '2026-05-19T12:00:00.000Z', 44000);

    const groups = selectLatestPrevious([duplicateA, older, duplicateB]);

    expect(groups.get(movementGroupKey(older))?.latest.snapshotId).toBe('s2-b');
    expect(groups.get(movementGroupKey(older))?.previous?.snapshotId).toBe('s1');
  });

  it('uses null previous when only one distinct capture time exists', () => {
    const only = snapshot('s1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000);

    const groups = selectLatestPrevious([only]);

    expect(groups.get(movementGroupKey(only))?.latest.snapshotId).toBe('s1');
    expect(groups.get(movementGroupKey(only))?.previous).toBeNull();
  });
});
