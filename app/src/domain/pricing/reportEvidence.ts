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
