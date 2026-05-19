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
