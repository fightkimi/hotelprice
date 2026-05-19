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
