# Domain Core Rate Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure TypeScript domain core for hotel rate comparability, availability suppression, deterministic snapshot ordering, and alert candidate math.

**Architecture:** Keep the F-007 UI unchanged. Add small focused modules under `app/src/domain/pricing/`, each exporting pure functions with no browser, network, storage, credential, or live collection behavior. Domain behavior is driven by Vitest tests under `app/tests/domain/` and fixture/manual data only.

**Tech Stack:** TypeScript, Vitest, existing Vite app workspace, no new runtime dependencies.

---

## Scope Check

This feature is only the domain core. It does not add screens, API routes, persistence, auth, deployment, live OTA collection, channel manager integration, PMS integration, or automatic pricing actions.

## Planned File Changes

Create:

- `app/src/domain/pricing/types.ts`
- `app/src/domain/pricing/rateKey.ts`
- `app/src/domain/pricing/availability.ts`
- `app/src/domain/pricing/snapshotOrdering.ts`
- `app/src/domain/pricing/reportEvidence.ts`
- `app/src/domain/pricing/alertRules.ts`
- `app/src/domain/pricing/index.ts`
- `app/tests/domain/rateKey.test.ts`
- `app/tests/domain/availability.test.ts`
- `app/tests/domain/snapshotOrdering.test.ts`
- `app/tests/domain/alertRules.test.ts`
- `app/tests/domain/complianceScan.test.ts`
- `docs/test-reports/2026-05-19-f-008-generator-notes.md`

Update after implementation:

- `features.json`
- `progress.json`
- `backlog.json`
- `.auto-memory/project-status.md`

Do not modify:

- `app/src/App.tsx`
- `app/src/screens/*`
- `app/src/components/*`
- `app/src/data/demoDataset.ts`
- `app/tests/e2e/app-foundation.spec.ts`
- package, build, or migration configuration

## Task 1: Comparable Rate Key Contract

**Files:**

- Create: `app/src/domain/pricing/types.ts`
- Create: `app/src/domain/pricing/rateKey.ts`
- Create: `app/src/domain/pricing/index.ts`
- Test: `app/tests/domain/rateKey.test.ts`

- [ ] **Step 1: Write the failing rate-key tests**

Create `app/tests/domain/rateKey.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the rate-key test and verify RED**

Run:

```bash
cd app
npm test -- tests/domain/rateKey.test.ts
```

Expected: FAIL because `src/domain/pricing` does not exist.

- [ ] **Step 3: Add the rate-key types and helpers**

Create `app/src/domain/pricing/types.ts`:

```ts
export type SourceKind = 'fixture' | 'manual' | 'approved_api';
export type AvailabilityStatus = 'available' | 'unavailable' | 'no_rate' | 'source_error' | 'stale';
export type HotelRole = 'owner' | 'competitor';
export type CompetitorLevel = 'owner' | 'core' | 'reference';

export interface HotelProfile {
  hotelId: string;
  ownerPropertyId: string;
  name: string;
  role: HotelRole;
  competitorLevel: CompetitorLevel;
  competitorGroupId: string;
  active: boolean;
}

export interface ComparableRateKey {
  channel: string;
  sourceId: string;
  stayDate: string;
  checkoutDate: string;
  currency: string;
  occupancyAdults: number;
  roomTypeKey: string;
  mealPlan: string;
  cancellationPolicy: string;
  taxFeeBasis: 'included' | 'excluded' | 'unknown';
}

export interface RateSnapshot {
  snapshotId: string;
  hotelId: string;
  ownerPropertyId: string;
  competitorGroupId: string;
  capturedAt: string;
  sourceKind: SourceKind;
  availabilityStatus: AvailabilityStatus;
  unavailableReason: string | null;
  priceCents: number | null;
  rateKey: ComparableRateKey;
}

export type AlertableRateSnapshot = RateSnapshot & {
  availabilityStatus: 'available';
  priceCents: number;
};
```

Create `app/src/domain/pricing/rateKey.ts`:

```ts
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
```

Create `app/src/domain/pricing/index.ts`:

```ts
export * from './types';
export * from './rateKey';
```

- [ ] **Step 4: Verify the rate-key test GREEN**

Run:

```bash
cd app
npm test -- tests/domain/rateKey.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add app/src/domain/pricing/types.ts app/src/domain/pricing/rateKey.ts app/src/domain/pricing/index.ts app/tests/domain/rateKey.test.ts
git commit -m "feat: add rate comparability keys"
```

## Task 2: Availability And Staleness

**Files:**

- Create: `app/src/domain/pricing/availability.ts`
- Modify: `app/src/domain/pricing/index.ts`
- Test: `app/tests/domain/availability.test.ts`

- [ ] **Step 1: Write the failing availability tests**

Create `app/tests/domain/availability.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the availability test and verify RED**

Run:

```bash
cd app
npm test -- tests/domain/availability.test.ts
```

Expected: FAIL because `isAlertableSnapshot` and `markStaleSnapshots` do not exist.

- [ ] **Step 3: Add availability helpers**

Create `app/src/domain/pricing/availability.ts`:

```ts
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
```

Append to `app/src/domain/pricing/index.ts`:

```ts
export * from './availability';
```

- [ ] **Step 4: Verify the availability test GREEN**

Run:

```bash
cd app
npm test -- tests/domain/availability.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add app/src/domain/pricing/availability.ts app/src/domain/pricing/index.ts app/tests/domain/availability.test.ts
git commit -m "feat: add rate availability rules"
```

## Task 3: Deterministic Snapshot Ordering

**Files:**

- Create: `app/src/domain/pricing/snapshotOrdering.ts`
- Modify: `app/src/domain/pricing/index.ts`
- Test: `app/tests/domain/snapshotOrdering.test.ts`

- [ ] **Step 1: Write the failing ordering tests**

Create `app/tests/domain/snapshotOrdering.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the ordering test and verify RED**

Run:

```bash
cd app
npm test -- tests/domain/snapshotOrdering.test.ts
```

Expected: FAIL because `selectLatestPrevious` does not exist.

- [ ] **Step 3: Add deterministic ordering**

Create `app/src/domain/pricing/snapshotOrdering.ts`:

```ts
import { movementGroupKey } from './rateKey';
import type { RateSnapshot } from './types';

export interface LatestPrevious {
  latest: RateSnapshot;
  previous: RateSnapshot | null;
}

function compareSnapshots(a: RateSnapshot, b: RateSnapshot): number {
  const byCapture = Date.parse(a.capturedAt) - Date.parse(b.capturedAt);
  if (byCapture !== 0) {
    return byCapture;
  }
  return a.snapshotId.localeCompare(b.snapshotId);
}

export function selectLatestPrevious(snapshots: RateSnapshot[]): Map<string, LatestPrevious> {
  const byMovementGroup = new Map<string, RateSnapshot[]>();

  for (const snapshot of snapshots) {
    const key = movementGroupKey(snapshot);
    byMovementGroup.set(key, [...(byMovementGroup.get(key) ?? []), snapshot]);
  }

  const selected = new Map<string, LatestPrevious>();

  for (const [key, groupSnapshots] of byMovementGroup) {
    const winnersByCapture = new Map<string, RateSnapshot>();

    for (const snapshot of [...groupSnapshots].sort(compareSnapshots)) {
      winnersByCapture.set(snapshot.capturedAt, snapshot);
    }

    const orderedWinners = [...winnersByCapture.values()].sort(compareSnapshots);
    selected.set(key, {
      latest: orderedWinners[orderedWinners.length - 1],
      previous: orderedWinners.length > 1 ? orderedWinners[orderedWinners.length - 2] : null
    });
  }

  return selected;
}
```

Append to `app/src/domain/pricing/index.ts`:

```ts
export * from './snapshotOrdering';
```

- [ ] **Step 4: Verify the ordering test GREEN**

Run:

```bash
cd app
npm test -- tests/domain/snapshotOrdering.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add app/src/domain/pricing/snapshotOrdering.ts app/src/domain/pricing/index.ts app/tests/domain/snapshotOrdering.test.ts
git commit -m "feat: add deterministic rate snapshot ordering"
```

## Task 4: Alert Candidate Rules

**Files:**

- Modify: `app/src/domain/pricing/types.ts`
- Create: `app/src/domain/pricing/reportEvidence.ts`
- Create: `app/src/domain/pricing/alertRules.ts`
- Modify: `app/src/domain/pricing/index.ts`
- Test: `app/tests/domain/alertRules.test.ts`

- [ ] **Step 1: Write the failing alert-rule tests**

Create `app/tests/domain/alertRules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { generateAlertCandidates } from '../../src/domain/pricing';
import type { ComparableRateKey, HotelProfile, RateSnapshot } from '../../src/domain/pricing';

const key: ComparableRateKey = {
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

const otherRoomKey: ComparableRateKey = {
  ...key,
  roomTypeKey: 'deluxe-king'
};

const hotels: HotelProfile[] = [
  { hotelId: 'owner', ownerPropertyId: 'owner-westlake', name: 'Owner', role: 'owner', competitorLevel: 'owner', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-a', ownerPropertyId: 'owner-westlake', name: 'A', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-b', ownerPropertyId: 'owner-westlake', name: 'B', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-c', ownerPropertyId: 'owner-westlake', name: 'C', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-ref', ownerPropertyId: 'owner-westlake', name: 'Reference', role: 'competitor', competitorLevel: 'reference', competitorGroupId: 'core-westlake', active: true },
  { hotelId: 'comp-off', ownerPropertyId: 'owner-westlake', name: 'Inactive', role: 'competitor', competitorLevel: 'core', competitorGroupId: 'core-westlake', active: false }
];

function snap(
  snapshotId: string,
  hotelId: string,
  capturedAt: string,
  priceCents: number | null,
  rateKey: ComparableRateKey = key,
  availabilityStatus: RateSnapshot['availabilityStatus'] = 'available'
): RateSnapshot {
  return {
    snapshotId,
    hotelId,
    ownerPropertyId: 'owner-westlake',
    competitorGroupId: 'core-westlake',
    capturedAt,
    sourceKind: 'fixture',
    availabilityStatus,
    unavailableReason: availabilityStatus === 'available' ? null : availabilityStatus,
    priceCents,
    rateKey
  };
}

function generate(snapshots: RateSnapshot[]) {
  return generateAlertCandidates({ hotels, snapshots, now: '2026-05-19T20:00:00.000Z' });
}

describe('alert candidate rules', () => {
  it('emits competitor increase at +10 percent for the same hotel and comparable key', () => {
    const alerts = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000)
    ]);

    expect(alerts).toEqual([
      expect.objectContaining({
        alertType: 'competitor_increase',
        hotelId: 'comp-a',
        oldPriceCents: 40000,
        newPriceCents: 44000,
        changeRate: 0.1,
        requiresHumanReview: true
      })
    ]);
  });

  it('emits competitor decrease at -10 percent for the same hotel and comparable key', () => {
    const alerts = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 50000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 45000)
    ]);

    expect(alerts[0]).toEqual(expect.objectContaining({ alertType: 'competitor_decrease', changeRate: -0.1 }));
  });

  it('suppresses movement below threshold and when latest is unavailable', () => {
    const smallMove = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 42000)
    ]);
    const unavailableLatest = generate([
      snap('b1', 'comp-b', '2026-05-19T08:00:00.000Z', 40000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', null, key, 'unavailable')
    ]);

    expect(smallMove).toHaveLength(0);
    expect(unavailableLatest).toHaveLength(0);
  });

  it('does not compare different hotels with the same comparable key', () => {
    const alerts = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('b1', 'comp-b', '2026-05-19T12:00:00.000Z', 48000)
    ]);

    expect(alerts).toHaveLength(0);
  });

  it('emits market movement only when three active core competitors are available at both capture times', () => {
    const qualified = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('b1', 'comp-b', '2026-05-19T08:00:00.000Z', 50000),
      snap('c1', 'comp-c', '2026-05-19T08:00:00.000Z', 60000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 55000),
      snap('c2', 'comp-c', '2026-05-19T12:00:00.000Z', 66000)
    ]);
    const underSampled = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('b1', 'comp-b', '2026-05-19T08:00:00.000Z', 50000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 55000)
    ]);

    expect(qualified.some((alert) => alert.alertType === 'market_increase' && alert.sampleSize === 3)).toBe(true);
    expect(underSampled.some((alert) => alert.alertType === 'market_increase')).toBe(false);
  });

  it('emits owner low and high risk only against exact comparable core competitor rates', () => {
    const lowRisk = generate([
      snap('owner-1', 'owner', '2026-05-19T12:00:00.000Z', 30000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 50000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 50000),
      snap('c2', 'comp-c', '2026-05-19T12:00:00.000Z', 50000),
      snap('ref-2', 'comp-ref', '2026-05-19T12:00:00.000Z', 10000),
      snap('other-room', 'comp-a', '2026-05-19T12:00:00.000Z', 30000, otherRoomKey)
    ]);
    const highRisk = generate([
      snap('owner-1', 'owner', '2026-05-19T12:00:00.000Z', 65000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 50000),
      snap('b2', 'comp-b', '2026-05-19T12:00:00.000Z', 50000),
      snap('c2', 'comp-c', '2026-05-19T12:00:00.000Z', 50000)
    ]);

    expect(lowRisk.some((alert) => alert.alertType === 'owner_low_risk' && alert.sampleSize === 3)).toBe(true);
    expect(highRisk.some((alert) => alert.alertType === 'owner_high_risk' && alert.sampleSize === 3)).toBe(true);
  });

  it('includes human-review evidence and never emits a recommended new price', () => {
    const [alert] = generate([
      snap('a1', 'comp-a', '2026-05-19T08:00:00.000Z', 40000),
      snap('a2', 'comp-a', '2026-05-19T12:00:00.000Z', 44000)
    ]);

    expect(alert.requiresHumanReview).toBe(true);
    expect(alert.evidence[0]).toEqual(expect.objectContaining({
      sourceKind: 'fixture',
      capturedAt: '2026-05-19T12:00:00.000Z',
      hotelId: 'comp-a',
      sampleSize: 1
    }));
    expect(alert).not.toHaveProperty('recommendedPriceCents');
  });
});
```

- [ ] **Step 2: Run the alert-rule test and verify RED**

Run:

```bash
cd app
npm test -- tests/domain/alertRules.test.ts
```

Expected: FAIL because `generateAlertCandidates` does not exist.

- [ ] **Step 3: Add alert and evidence types**

Append to `app/src/domain/pricing/types.ts`:

```ts
export type AlertType =
  | 'competitor_increase'
  | 'competitor_decrease'
  | 'market_increase'
  | 'market_decrease'
  | 'owner_low_risk'
  | 'owner_high_risk';

export interface AlertEvidence {
  sourceKind: SourceKind;
  capturedAt: string;
  hotelId: string;
  rateKeyId: string;
  sampleSize: number;
}

export interface AlertCandidate {
  alertId: string;
  alertType: AlertType;
  severity: 'info' | 'warning' | 'risk';
  ownerPropertyId: string;
  hotelId: string;
  competitorGroupId: string;
  rateKey: ComparableRateKey;
  oldPriceCents: number | null;
  newPriceCents: number | null;
  changeRate: number;
  sampleSize: number;
  evidence: AlertEvidence[];
  requiresHumanReview: true;
}

export interface GenerateAlertCandidatesInput {
  hotels: HotelProfile[];
  snapshots: RateSnapshot[];
  now: string;
}
```

Create `app/src/domain/pricing/reportEvidence.ts`:

```ts
import { comparableRateKeyId } from './rateKey';
import type { AlertEvidence, RateSnapshot } from './types';

export function evidenceForSnapshot(snapshot: RateSnapshot, sampleSize: number): AlertEvidence {
  return {
    sourceKind: snapshot.sourceKind,
    capturedAt: snapshot.capturedAt,
    hotelId: snapshot.hotelId,
    rateKeyId: comparableRateKeyId(snapshot.rateKey),
    sampleSize
  };
}
```

- [ ] **Step 4: Add alert-rule implementation**

Create `app/src/domain/pricing/alertRules.ts`:

```ts
import { isAlertableSnapshot, markStaleSnapshots } from './availability';
import { evidenceForSnapshot } from './reportEvidence';
import { comparableRateKeyId, marketGroupKey } from './rateKey';
import { selectLatestPrevious } from './snapshotOrdering';
import type { AlertableRateSnapshot, AlertCandidate, AlertType, GenerateAlertCandidatesInput, HotelProfile, RateSnapshot } from './types';

function roundRate(value: number): number {
  return Number(value.toFixed(4));
}

function changeRate(oldValue: number, newValue: number): number {
  return roundRate((newValue - oldValue) / oldValue);
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function alertId(alertType: AlertType, hotelId: string, capturedAt: string, rateKeyId: string): string {
  return `${alertType}:${hotelId}:${capturedAt}:${rateKeyId}`;
}

function makeAlert(params: {
  alertType: AlertType;
  severity: AlertCandidate['severity'];
  snapshot: RateSnapshot;
  oldPriceCents: number | null;
  newPriceCents: number | null;
  changeRateValue: number;
  sampleSize: number;
  evidence: AlertCandidate['evidence'];
}): AlertCandidate {
  const rateKeyId = comparableRateKeyId(params.snapshot.rateKey);
  return {
    alertId: alertId(params.alertType, params.snapshot.hotelId, params.snapshot.capturedAt, rateKeyId),
    alertType: params.alertType,
    severity: params.severity,
    ownerPropertyId: params.snapshot.ownerPropertyId,
    hotelId: params.snapshot.hotelId,
    competitorGroupId: params.snapshot.competitorGroupId,
    rateKey: params.snapshot.rateKey,
    oldPriceCents: params.oldPriceCents,
    newPriceCents: params.newPriceCents,
    changeRate: params.changeRateValue,
    sampleSize: params.sampleSize,
    evidence: params.evidence,
    requiresHumanReview: true
  };
}

function activeHotelById(hotels: HotelProfile[]): Map<string, HotelProfile> {
  return new Map(hotels.filter((hotel) => hotel.active).map((hotel) => [hotel.hotelId, hotel]));
}

function generateCompetitorMovementAlerts(snapshots: RateSnapshot[], hotels: Map<string, HotelProfile>): AlertCandidate[] {
  const alerts: AlertCandidate[] = [];
  const groups = selectLatestPrevious(snapshots);

  for (const { latest, previous } of groups.values()) {
    const hotel = hotels.get(latest.hotelId);
    if (!hotel || hotel.role !== 'competitor' || !previous || !isAlertableSnapshot(latest) || !isAlertableSnapshot(previous)) {
      continue;
    }

    const delta = changeRate(previous.priceCents, latest.priceCents);
    if (delta >= 0.1) {
      alerts.push(makeAlert({
        alertType: 'competitor_increase',
        severity: 'warning',
        snapshot: latest,
        oldPriceCents: previous.priceCents,
        newPriceCents: latest.priceCents,
        changeRateValue: delta,
        sampleSize: 1,
        evidence: [evidenceForSnapshot(latest, 1), evidenceForSnapshot(previous, 1)]
      }));
    }
    if (delta <= -0.1) {
      alerts.push(makeAlert({
        alertType: 'competitor_decrease',
        severity: 'info',
        snapshot: latest,
        oldPriceCents: previous.priceCents,
        newPriceCents: latest.priceCents,
        changeRateValue: delta,
        sampleSize: 1,
        evidence: [evidenceForSnapshot(latest, 1), evidenceForSnapshot(previous, 1)]
      }));
    }
  }

  return alerts;
}

function captureAverage(
  captureSnapshots: RateSnapshot[],
  hotels: Map<string, HotelProfile>
): { sampleSize: number; averageCents: number; evidence: AlertCandidate['evidence']; anchor: AlertableRateSnapshot } | null {
  const latestByHotel = new Map<string, AlertableRateSnapshot>();
  for (const snapshot of captureSnapshots) {
    const hotel = hotels.get(snapshot.hotelId);
    if (hotel?.role === 'competitor' && hotel.competitorLevel === 'core' && isAlertableSnapshot(snapshot)) {
      const existing = latestByHotel.get(snapshot.hotelId);
      if (!existing || snapshot.snapshotId.localeCompare(existing.snapshotId) > 0) {
        latestByHotel.set(snapshot.hotelId, snapshot);
      }
    }
  }

  const samples = [...latestByHotel.values()];
  if (samples.length < 3) {
    return null;
  }

  return {
    sampleSize: samples.length,
    averageCents: average(samples.map((snapshot) => snapshot.priceCents)),
    evidence: samples.map((snapshot) => evidenceForSnapshot(snapshot, samples.length)),
    anchor: samples[0]
  };
}

function generateMarketMovementAlerts(snapshots: RateSnapshot[], hotels: Map<string, HotelProfile>): AlertCandidate[] {
  const byMarket = new Map<string, RateSnapshot[]>();
  for (const snapshot of snapshots) {
    byMarket.set(marketGroupKey(snapshot), [...(byMarket.get(marketGroupKey(snapshot)) ?? []), snapshot]);
  }

  const alerts: AlertCandidate[] = [];
  for (const groupSnapshots of byMarket.values()) {
    const byCapture = new Map<string, RateSnapshot[]>();
    for (const snapshot of groupSnapshots) {
      byCapture.set(snapshot.capturedAt, [...(byCapture.get(snapshot.capturedAt) ?? []), snapshot]);
    }

    const captureTimes = [...byCapture.keys()].sort((a, b) => Date.parse(a) - Date.parse(b));
    if (captureTimes.length < 2) {
      continue;
    }

    const previousTime = captureTimes[captureTimes.length - 2];
    const latestTime = captureTimes[captureTimes.length - 1];
    const previous = captureAverage(byCapture.get(previousTime) ?? [], hotels);
    const latest = captureAverage(byCapture.get(latestTime) ?? [], hotels);

    if (!previous || !latest) {
      continue;
    }

    const delta = changeRate(previous.averageCents, latest.averageCents);
    if (delta >= 0.08) {
      alerts.push(makeAlert({
        alertType: 'market_increase',
        severity: 'warning',
        snapshot: latest.anchor,
        oldPriceCents: Math.round(previous.averageCents),
        newPriceCents: Math.round(latest.averageCents),
        changeRateValue: delta,
        sampleSize: latest.sampleSize,
        evidence: latest.evidence
      }));
    }
    if (delta <= -0.08) {
      alerts.push(makeAlert({
        alertType: 'market_decrease',
        severity: 'info',
        snapshot: latest.anchor,
        oldPriceCents: Math.round(previous.averageCents),
        newPriceCents: Math.round(latest.averageCents),
        changeRateValue: delta,
        sampleSize: latest.sampleSize,
        evidence: latest.evidence
      }));
    }
  }
  return alerts;
}

function latestAlertablePerHotel(snapshots: RateSnapshot[]): AlertableRateSnapshot[] {
  const groups = selectLatestPrevious(snapshots);
  return [...groups.values()].map((group) => group.latest).filter(isAlertableSnapshot);
}

function generateOwnerPositionAlerts(snapshots: RateSnapshot[], hotels: Map<string, HotelProfile>): AlertCandidate[] {
  const latest = latestAlertablePerHotel(snapshots);
  const ownerSnapshots = latest.filter((snapshot) => hotels.get(snapshot.hotelId)?.role === 'owner');
  const alerts: AlertCandidate[] = [];

  for (const ownerSnapshot of ownerSnapshots) {
    const ownerMarketKey = marketGroupKey(ownerSnapshot);
    const competitorSamples = latest.filter((snapshot) => {
      const hotel = hotels.get(snapshot.hotelId);
      return hotel?.role === 'competitor' && hotel.competitorLevel === 'core' && marketGroupKey(snapshot) === ownerMarketKey;
    });

    if (competitorSamples.length < 3) {
      continue;
    }

    const competitorAverage = average(competitorSamples.map((snapshot) => snapshot.priceCents));
    const gap = changeRate(competitorAverage, ownerSnapshot.priceCents);
    const evidence = competitorSamples.map((snapshot) => evidenceForSnapshot(snapshot, competitorSamples.length));

    if (gap <= -0.2) {
      alerts.push(makeAlert({
        alertType: 'owner_low_risk',
        severity: 'risk',
        snapshot: ownerSnapshot,
        oldPriceCents: Math.round(competitorAverage),
        newPriceCents: ownerSnapshot.priceCents,
        changeRateValue: gap,
        sampleSize: competitorSamples.length,
        evidence
      }));
    }
    if (gap >= 0.2) {
      alerts.push(makeAlert({
        alertType: 'owner_high_risk',
        severity: 'risk',
        snapshot: ownerSnapshot,
        oldPriceCents: Math.round(competitorAverage),
        newPriceCents: ownerSnapshot.priceCents,
        changeRateValue: gap,
        sampleSize: competitorSamples.length,
        evidence
      }));
    }
  }

  return alerts;
}

export function generateAlertCandidates(input: GenerateAlertCandidatesInput): AlertCandidate[] {
  const hotels = activeHotelById(input.hotels);
  const snapshots = markStaleSnapshots(input.snapshots, input.now);

  return [
    ...generateCompetitorMovementAlerts(snapshots, hotels),
    ...generateMarketMovementAlerts(snapshots, hotels),
    ...generateOwnerPositionAlerts(snapshots, hotels)
  ];
}
```

Append to `app/src/domain/pricing/index.ts`:

```ts
export * from './reportEvidence';
export * from './alertRules';
```

- [ ] **Step 5: Verify the alert-rule test GREEN**

Run:

```bash
cd app
npm test -- tests/domain/alertRules.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add app/src/domain/pricing/types.ts app/src/domain/pricing/reportEvidence.ts app/src/domain/pricing/alertRules.ts app/src/domain/pricing/index.ts app/tests/domain/alertRules.test.ts
git commit -m "feat: generate pricing alert candidates"
```

## Task 5: Compliance Static Scan

**Files:**

- Test: `app/tests/domain/complianceScan.test.ts`

- [ ] **Step 1: Write the compliance scan**

Create `app/tests/domain/complianceScan.test.ts`:

```ts
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe('domain core compliance boundary', () => {
  it('does not include live collection, credential, browser, storage, or automatic pricing code', () => {
    const source = filesUnder('src/domain/pricing')
      .filter((path) => path.endsWith('.ts'))
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|axios|document\.cookie|localStorage|sessionStorage/);
    expect(source).not.toMatch(/playwright|selenium|puppeteer|captcha|crawler|scrap/i);
    expect(source).not.toMatch(/api[_-]?key|secret|password|credential/i);
    expect(source).not.toMatch(/auto(?:matic)?\s*price|auto(?:matic)?\s*rate|recommendedPriceCents/);
  });
});
```

- [ ] **Step 2: Run the compliance scan**

Run:

```bash
cd app
npm test -- tests/domain/complianceScan.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit Task 5**

Run:

```bash
git add app/tests/domain/complianceScan.test.ts
git commit -m "test: guard domain core compliance boundaries"
```

## Task 6: Generator Verification And Handoff

**Files:**

- Create: `docs/test-reports/2026-05-19-f-008-generator-notes.md`
- Modify: `features.json`
- Modify: `progress.json`
- Modify: `backlog.json`
- Modify: `.auto-memory/project-status.md`

- [ ] **Step 1: Run all domain tests**

Run:

```bash
cd app
npm test -- tests/domain
```

Expected: all domain tests pass.

- [ ] **Step 2: Run full app verification**

Run:

```bash
cd app
npm run verify
```

Expected: build, Vitest, and Playwright screenshot checks pass.

- [ ] **Step 3: Run root workflow verification**

Run from project root:

```bash
python3 scripts/triad_doctor.py
python3 scripts/test_triad_doctor.py
python3 -m json.tool progress.json
python3 -m json.tool features.json
python3 -m json.tool backlog.json
node tests/client_demo_prototype.test.js
```

Expected: all commands exit 0.

- [ ] **Step 4: Record Generator notes**

Create `docs/test-reports/2026-05-19-f-008-generator-notes.md` with:

```md
# F-008 Generator Notes

## Scope

Implemented the pure TypeScript domain core for rate comparability, availability suppression, deterministic snapshot ordering, alert candidate math, and compliance scanning.

## TDD Evidence

- `rateKey.test.ts`: RED before `app/src/domain/pricing` existed; GREEN after `types.ts`, `rateKey.ts`, and `index.ts`.
- `availability.test.ts`: RED before availability helpers existed; GREEN after `availability.ts`.
- `snapshotOrdering.test.ts`: RED before deterministic ordering existed; GREEN after `snapshotOrdering.ts`.
- `alertRules.test.ts`: RED before alert generation existed; GREEN after `types.ts`, `reportEvidence.ts`, and `alertRules.ts`.
- `complianceScan.test.ts`: GREEN after domain source existed and static safety scan found no live collection, credential, browser, storage, or automatic pricing code.

## Verification Commands

- `cd app && npm test -- tests/domain`
- `cd app && npm run verify`
- `python3 scripts/triad_doctor.py`
- `python3 scripts/test_triad_doctor.py`
- `python3 -m json.tool progress.json`
- `python3 -m json.tool features.json`
- `python3 -m json.tool backlog.json`
- `node tests/client_demo_prototype.test.js`

## Evaluator Focus

Verify unavailable/stale suppression, `hotelId + comparableRateKey` isolation, duplicate capture ordering, three-core-competitor sample gates, human-review-only alert shape, no recommended price, static compliance scan, and PR readiness.
```

- [ ] **Step 5: Move F-008 to verification state**

Update state files after implementation and verification:

- `features.json`: set `F-008-domain-core-rate-boundaries` to `verifying`, executor `generator`, and include all domain source/test files plus Generator notes in artifacts.
- `progress.json`: set `status` to `verifying`, keep `batch_id` as `domain-core-rate-boundaries`, and keep `current_sprint` as `F-008-domain-core-rate-boundaries`.
- `backlog.json`: mark `B-023` done and keep `B-024` new.
- `.auto-memory/project-status.md`: record Generator implementation facts and set next step to Evaluator verification.

- [ ] **Step 6: Commit Generator notes and state**

Run:

```bash
git add docs/test-reports/2026-05-19-f-008-generator-notes.md features.json progress.json backlog.json .auto-memory/project-status.md
git commit -m "chore: hand off f-008 for verification"
```

## Evaluator Checklist

- Unavailable, no-rate, source-error, and stale snapshots never emit pricing alerts.
- Competitor movement is isolated by `hotelId + comparableRateKey`.
- Same comparable key across different hotels does not compare across hotels.
- Duplicate same-capture snapshots resolve deterministically by lexicographically last `snapshotId`.
- Latest/previous movement requires two distinct capture times.
- Market movement requires at least three active core competitors at both compared capture times.
- Owner low/high risk requires exact comparable key and at least three active core competitor samples.
- Every alert has `requiresHumanReview: true`, evidence, source kind, capture time, hotel id, rate key id, and sample size.
- No alert includes a recommended price or automatic pricing action.
- Domain module passes the static no-live-collection scan.
- `cd app && npm run verify` passes.
- Root Triad checks, JSON checks, old prototype tests, PR readiness, and feature branch hygiene pass.

## Planner Self-Review

- Spec coverage: availability modeling, hotel/rate-key isolation, deterministic ordering, duplicate handling, market sample gates, owner-position gates, human-review alerts, no recommended price, compliance scan, and regression verification all map to tasks above.
- Placeholder scan: the plan contains concrete paths, tests, commands, expected red/green outcomes, and state updates.
- Type consistency: `ComparableRateKey`, `RateSnapshot`, `HotelProfile`, `AlertCandidate`, `GenerateAlertCandidatesInput`, `comparableRateKeyId`, `movementGroupKey`, `marketGroupKey`, `isAlertableSnapshot`, `markStaleSnapshots`, `selectLatestPrevious`, and `generateAlertCandidates` are defined before use.
