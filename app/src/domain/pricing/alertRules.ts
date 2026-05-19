import { isAlertableSnapshot, markStaleSnapshots } from './availability';
import { evidenceForSnapshot } from './reportEvidence';
import { comparableRateKeyId, marketGroupKey, movementGroupKey } from './rateKey';
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

function compareSnapshots(a: RateSnapshot, b: RateSnapshot): number {
  const byCapture = Date.parse(a.capturedAt) - Date.parse(b.capturedAt);
  if (byCapture !== 0) {
    return byCapture;
  }
  return a.snapshotId.localeCompare(b.snapshotId);
}

function selectCompetitorMovementPair(groupSnapshots: RateSnapshot[]): { latest: AlertableRateSnapshot; previous: AlertableRateSnapshot } | null {
  const winnersByCapture = new Map<string, RateSnapshot>();
  for (const snapshot of [...groupSnapshots].sort(compareSnapshots)) {
    winnersByCapture.set(snapshot.capturedAt, snapshot);
  }

  const orderedWinners = [...winnersByCapture.values()].sort(compareSnapshots);
  const latestOverall = orderedWinners[orderedWinners.length - 1];
  if (!isAlertableSnapshot(latestOverall)) {
    return null;
  }

  const previous = orderedWinners.slice(0, -1).reverse().find(isAlertableSnapshot);
  return previous ? { latest: latestOverall, previous } : null;
}

function generateCompetitorMovementAlerts(snapshots: RateSnapshot[], hotels: Map<string, HotelProfile>): AlertCandidate[] {
  const alerts: AlertCandidate[] = [];
  const groups = new Map<string, RateSnapshot[]>();
  for (const snapshot of snapshots) {
    const key = movementGroupKey(snapshot);
    groups.set(key, [...(groups.get(key) ?? []), snapshot]);
  }

  for (const groupSnapshots of groups.values()) {
    const selected = selectCompetitorMovementPair(groupSnapshots);
    if (!selected) {
      continue;
    }
    const { latest, previous } = selected;
    const hotel = hotels.get(latest.hotelId);
    if (!hotel || hotel.role !== 'competitor') {
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
    const key = marketGroupKey(snapshot);
    byMarket.set(key, [...(byMarket.get(key) ?? []), snapshot]);
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
