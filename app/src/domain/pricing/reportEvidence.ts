import { comparableRateKeyId } from './rateKey';
import type { AlertEvidence, AlertEvidenceRole, RateSnapshot } from './types';

export function evidenceForSnapshot(snapshot: RateSnapshot, sampleSize: number, role: AlertEvidenceRole): AlertEvidence {
  return {
    role,
    sourceKind: snapshot.sourceKind,
    capturedAt: snapshot.capturedAt,
    hotelId: snapshot.hotelId,
    rateKeyId: comparableRateKeyId(snapshot.rateKey),
    sampleSize,
    priceCents: snapshot.priceCents
  };
}
