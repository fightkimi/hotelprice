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
