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

export interface TrendSeries {
  id: string;
  label: string;
  colorToken: string;
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

export interface DemoDataset {
  sourceKind: SourceKind;
  liveCollectionEnabled: false;
  demoDisclosure: string;
  context: ContextSelection;
  trend: {
    series: TrendSeries[];
    events: EventMarker[];
    yAxisUnit: 'CNY';
    sampleSize: number;
  };
  heatmap: { days: HeatmapDay[] };
  platformGaps: { rows: PlatformGapRow[]; maxGap: number; unit: 'CNY' };
  signals: Signal[];
}
