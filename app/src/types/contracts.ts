export type SourceKind = 'fixture-demo';

export type Severity = 'normal' | 'warning' | 'risk' | 'softness';

export interface RateKey {
  hotelId: string;
  competitorGroupId: string;
  roomType: string;
  platform: string;
  stayDate: string;
  occupancy: number;
  mealPlan: string;
  taxFeeBasis: string;
  cancellationPolicy: string;
}

export interface PricePoint {
  date: string;
  value: number | null;
  currency: 'CNY';
  captureTime: string;
  rateKey: RateKey;
  occupancy: number;
  mealPlan: string;
  taxFeeBasis: string;
  cancellationPolicy: string;
}

export interface ContextSelection {
  property: string;
  roomType: string;
  platform: string;
  dateRange: string;
  competitorGroup: string;
  demandContext: string;
  captureTime: string;
}

export interface EvidenceMarker {
  label: string;
  source: string;
  captureTime: string;
  sampleSize: number;
  confidence: 'sample' | 'partial' | 'unavailable';
}

export interface Signal {
  id: string;
  title: string;
  primaryMetric: number;
  metricUnit: string;
  summary: string;
  severity: Severity;
  humanReviewRequired: boolean;
  evidenceMarkers: EvidenceMarker[];
}

export type AlertReviewStatus = 'needs_review' | 'reviewing' | 'noted';
export type AlertReviewPriority = 'high' | 'medium' | 'watch';

export interface AlertReviewStatusOption {
  id: AlertReviewStatus;
  label: string;
  description: string;
}

export interface AlertReviewNotePreset {
  id: string;
  label: string;
  text: string;
}

export interface AlertReviewEvidenceRow extends EvidenceMarker {
  role: 'latest_observation' | 'previous_observation' | 'market_sample' | 'owner_observation' | 'competitor_sample';
  price: number | null;
  status: 'available' | 'missing-sample';
}

export interface AlertReviewItem {
  id: string;
  signalId: string;
  alertType:
    | 'competitor_increase'
    | 'competitor_decrease'
    | 'market_increase'
    | 'market_decrease'
    | 'owner_low_risk'
    | 'owner_high_risk';
  title: string;
  summary: string;
  severity: Severity;
  primaryMetric: number;
  metricUnit: string;
  affectedStayDate: string;
  reviewPriority: AlertReviewPriority;
  defaultStatus: AlertReviewStatus;
  defaultNote: string;
  rateKey: RateKey;
  evidenceRows: AlertReviewEvidenceRow[];
  sampleSize: number;
  captureTime: string;
  humanReviewRequired: true;
}

export interface AlertReviewWorkflow {
  items: AlertReviewItem[];
  selectedItemId: string;
  statusOptions: AlertReviewStatusOption[];
  notePresets: AlertReviewNotePreset[];
  guardrails: string[];
}

export interface TrendSeries {
  id: string;
  label: string;
  colorVar: string;
  points: PricePoint[];
}

export interface EventMarker {
  date: string;
  label: string;
  type: 'holiday' | 'concert' | 'expo';
  lift: number;
  confidence: 'sample' | 'partial';
}

export interface HeatmapDay {
  date: string;
  label: string;
  intensity: number | null;
  coreAverage: number | null;
  ownerRate: number | null;
  eventLabel?: string;
  sampleSize: number;
  status: 'normal' | 'event-lift' | 'unavailable';
}

export interface PlatformGapRow {
  platform: string;
  ownerRate: number;
  coreAverage: number;
  gap: number;
  coverage: number;
}

export type MarketSampleStatus = 'available' | 'missing-sample' | 'stale' | 'unavailable' | 'source-error';

export interface MarketCompetitorSample {
  hotelId: string;
  hotelName: string;
  competitorLevel: 'core' | 'reference';
  price: number | null;
  gapToOwner: number | null;
  status: MarketSampleStatus;
  statusLabel: string;
  explanation: string;
  source: string;
  captureTime: string | null;
  rateKey: RateKey;
}

export interface MarketDrilldownOption {
  id: string;
  label: string;
  platform: string;
  stayDate: string;
  roomType: string;
  eventLabel: string;
  status: 'available' | 'missing-sample';
  gap: number | null;
  coverage: number;
  sampleSize: number;
}

export interface MarketCompetitorRange {
  min: number;
  max: number;
}

export interface MarketDrilldownDetail {
  id: string;
  platform: string;
  stayDate: string;
  roomType: string;
  status: 'available' | 'missing-sample';
  currency: 'CNY';
  ownerRate: number | null;
  coreAverage: number | null;
  gap: number | null;
  competitorRange: MarketCompetitorRange | null;
  coverage: number;
  sampleSize: number;
  captureTime: string | null;
  eventImpact: CalendarEventImpact;
  rateBasis: CalendarRateBasis;
  competitorSamples: MarketCompetitorSample[];
  evidenceMarkers: EvidenceMarker[];
  missingSampleReason?: string;
  humanReviewRequired: true;
}

export interface MarketComparisonDrilldown {
  options: MarketDrilldownOption[];
  selectedOptionId: string;
  byId: Record<string, MarketDrilldownDetail>;
  guardrails: string[];
}

export interface CalendarPlatformGapRow {
  platform: string;
  ownerRate: number | null;
  coreAverage: number | null;
  gap: number | null;
  coverage: number;
  sampleSize: number;
  captureTime: string | null;
  status: 'available' | 'missing-sample';
}

export interface CalendarEventImpact {
  label: string;
  type: 'normal' | 'weekend' | 'holiday' | 'concert' | 'expo';
  lift: number;
  confidence: 'sample' | 'partial';
}

export interface CalendarRateBasis {
  roomType: string;
  occupancy: number;
  mealPlan: string;
  taxFeeBasis: string;
  cancellationPolicy: string;
}

export interface CalendarDayDetail {
  stayDate: string;
  label: string;
  status: HeatmapDay['status'];
  currency: 'CNY';
  ownerRate: number | null;
  coreAverage: number | null;
  gap: number | null;
  sampleSize: number;
  eventImpact: CalendarEventImpact;
  platformGaps: CalendarPlatformGapRow[];
  evidenceMarkers: EvidenceMarker[];
  captureTime: string | null;
  rateBasis: CalendarRateBasis;
  missingSampleReason?: string;
  humanReviewRequired: true;
}

export interface DataScopePlatform {
  label: string;
  channel: string;
  sourceId: string;
  sourceKind: 'fixture' | 'manual' | 'approved_api';
  enabled: boolean;
}

export interface DataScopeSummary {
  ownerPropertyId: string;
  ownerHotelId: string;
  ownerHotelName: string;
  competitorGroupId: string;
  competitorGroupLabel: string;
  competitorCoverage: {
    coreCount: number;
    referenceCount: number;
    activeHotelIds: string[];
  };
  platforms: DataScopePlatform[];
  stayWindow: {
    startDate: string;
    endDate: string;
    totalStayDates: number;
    focusDate: string;
  };
  rateBasis: {
    currency: 'CNY';
    occupancyAdults: number[];
    roomTypes: string[];
    mealPlans: string[];
    cancellationPolicies: string[];
    taxFeeBasis: string[];
  };
  freshness: {
    currentCaptureTime: string;
    staleAfterHours: number;
  };
  guardrails: string[];
}

export type CaptureEntryId = 'fixture-demo' | 'manual-import' | 'approved-api';
export type CaptureEntryStatus = 'active' | 'available' | 'requires-approval' | 'blocked';

export interface CaptureEntryOption {
  id: CaptureEntryId;
  label: string;
  sourceKind: 'fixture' | 'manual' | 'approved_api';
  status: CaptureEntryStatus;
  description: string;
  humanReviewRequired: boolean;
}

export interface CaptureEntryPreview {
  productionConnectionEnabled: false;
  activeEntryId: CaptureEntryId;
  options: CaptureEntryOption[];
  policyNotes: string[];
}

export interface DemoDataset {
  sourceKind: SourceKind;
  liveCollectionEnabled: false;
  demoDisclosure: string;
  context: ContextSelection;
  dataScope: DataScopeSummary;
  captureEntry: CaptureEntryPreview;
  trend: {
    series: TrendSeries[];
    events: EventMarker[];
    yAxisUnit: 'CNY';
    sampleSize: number;
  };
  heatmap: { days: HeatmapDay[] };
  calendarDetails: { byDate: Record<string, CalendarDayDetail> };
  platformGaps: { rows: PlatformGapRow[]; maxGap: number; unit: 'CNY' };
  marketDrilldown: MarketComparisonDrilldown;
  signals: Signal[];
  alertReview: AlertReviewWorkflow;
}
