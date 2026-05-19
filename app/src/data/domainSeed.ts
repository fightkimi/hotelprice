import type { AvailabilityStatus, ComparableRateKey, HotelProfile, RateSnapshot } from '../domain/pricing';

type DemoEventType = 'weekend' | 'holiday' | 'expo' | 'concert';

export interface DemoEventAnnotation {
  date: string;
  label: string;
  type: DemoEventType;
  lift: number;
  confidence: 'sample' | 'partial';
}

interface DemoPlatform {
  channel: string;
  sourceId: string;
  label: string;
}

export interface DomainDemoContext {
  ownerPropertyId: string;
  ownerHotelId: string;
  competitorGroupId: string;
  propertyName: string;
  roomTypeKey: string;
  roomTypeLabel: string;
  dateRange: string;
  demandContext: string;
  captureLabel: string;
  platformFocusDate: string;
}

export interface DomainDemoSeed {
  hotels: HotelProfile[];
  snapshots: RateSnapshot[];
  events: DemoEventAnnotation[];
  now: string;
  platforms: DemoPlatform[];
  context: DomainDemoContext;
}

const ownerPropertyId = 'owner-westlake';
const competitorGroupId = 'core-comp-demo-01';
const ownerHotelId = 'hotel-demo-westlake-001';
const latestCapture = '2026-05-19T09:30:00.000Z';
const previousCapture = '2026-05-18T09:30:00.000Z';

const platforms: DemoPlatform[] = [
  { channel: 'ctrip_fixture', sourceId: 'ctrip-demo', label: '携程演示源' },
  { channel: 'meituan_fixture', sourceId: 'meituan-demo', label: '美团演示源' },
  { channel: 'fliggy_fixture', sourceId: 'fliggy-demo', label: '飞猪演示源' },
  { channel: 'tongcheng_fixture', sourceId: 'tongcheng-demo', label: '同程演示源' }
];

const ctrip = platforms[0];

const hotels: HotelProfile[] = [
  {
    hotelId: ownerHotelId,
    ownerPropertyId,
    name: '西湖商务精选酒店',
    role: 'owner',
    competitorLevel: 'owner',
    competitorGroupId,
    active: true
  },
  {
    hotelId: 'comp-lakeview',
    ownerPropertyId,
    name: '湖景优选酒店',
    role: 'competitor',
    competitorLevel: 'core',
    competitorGroupId,
    active: true
  },
  {
    hotelId: 'comp-hub',
    ownerPropertyId,
    name: '商圈枢纽酒店',
    role: 'competitor',
    competitorLevel: 'core',
    competitorGroupId,
    active: true
  },
  {
    hotelId: 'comp-garden',
    ownerPropertyId,
    name: '花园行政酒店',
    role: 'competitor',
    competitorLevel: 'core',
    competitorGroupId,
    active: true
  },
  {
    hotelId: 'comp-reference',
    ownerPropertyId,
    name: '参考样本酒店',
    role: 'competitor',
    competitorLevel: 'reference',
    competitorGroupId,
    active: true
  }
];

function checkoutDate(stayDate: string): string {
  const date = new Date(`${stayDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function rateKey(stayDate: string, platform: DemoPlatform): ComparableRateKey {
  return {
    channel: platform.channel,
    sourceId: platform.sourceId,
    stayDate,
    checkoutDate: checkoutDate(stayDate),
    currency: 'CNY',
    occupancyAdults: 2,
    roomTypeKey: 'std-king',
    mealPlan: 'double-breakfast',
    cancellationPolicy: 'free-cancel-24h',
    taxFeeBasis: 'included'
  };
}

function snapshot(params: {
  snapshotId: string;
  hotelId: string;
  stayDate: string;
  platform: DemoPlatform;
  capturedAt?: string;
  availabilityStatus?: AvailabilityStatus;
  priceCents: number | null;
  unavailableReason?: string | null;
}): RateSnapshot {
  return {
    snapshotId: params.snapshotId,
    hotelId: params.hotelId,
    ownerPropertyId,
    competitorGroupId,
    capturedAt: params.capturedAt ?? latestCapture,
    sourceKind: 'fixture',
    availabilityStatus: params.availabilityStatus ?? 'available',
    unavailableReason: params.unavailableReason ?? null,
    priceCents: params.priceCents,
    rateKey: rateKey(params.stayDate, params.platform)
  };
}

const ctripTrendSnapshots: RateSnapshot[] = [
  snapshot({ snapshotId: 'owner-0524-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-05-24', platform: ctrip, priceCents: 52800 }),
  snapshot({ snapshotId: 'owner-0525-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-05-25', platform: ctrip, priceCents: 51800 }),
  snapshot({ snapshotId: 'owner-0526-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-05-26', platform: ctrip, priceCents: 52000 }),
  snapshot({
    snapshotId: 'owner-0527-ctrip-unavailable',
    hotelId: ownerHotelId,
    stayDate: '2026-05-27',
    platform: ctrip,
    availabilityStatus: 'unavailable',
    priceCents: null,
    unavailableReason: 'fixture_source_no_comparable_sample'
  }),
  snapshot({ snapshotId: 'owner-0528-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-05-28', platform: ctrip, priceCents: 55200 }),
  snapshot({ snapshotId: 'owner-0529-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-05-29', platform: ctrip, priceCents: 61800 }),
  snapshot({ snapshotId: 'owner-0530-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-05-30', platform: ctrip, priceCents: 58000 }),
  snapshot({ snapshotId: 'owner-0531-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-05-31', platform: ctrip, priceCents: 58000 }),
  snapshot({ snapshotId: 'owner-0601-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-06-01', platform: ctrip, priceCents: 63800 }),
  snapshot({ snapshotId: 'owner-0602-ctrip-latest', hotelId: ownerHotelId, stayDate: '2026-06-02', platform: ctrip, priceCents: 56800 }),
  snapshot({
    snapshotId: 'comp-lake-0527-ctrip-no-rate',
    hotelId: 'comp-lakeview',
    stayDate: '2026-05-27',
    platform: ctrip,
    availabilityStatus: 'no_rate',
    priceCents: null,
    unavailableReason: 'fixture_no_public_rate'
  }),
  snapshot({
    snapshotId: 'comp-hub-0527-ctrip-source-error',
    hotelId: 'comp-hub',
    stayDate: '2026-05-27',
    platform: ctrip,
    availabilityStatus: 'source_error',
    priceCents: null,
    unavailableReason: 'fixture_sample_gap'
  }),
  snapshot({
    snapshotId: 'comp-garden-0527-ctrip-unavailable',
    hotelId: 'comp-garden',
    stayDate: '2026-05-27',
    platform: ctrip,
    availabilityStatus: 'unavailable',
    priceCents: null,
    unavailableReason: 'fixture_unavailable'
  }),
  ...[
    ['2026-05-24', [54800, 55800, 53800]],
    ['2026-05-25', [53600, 54600, 52600]],
    ['2026-05-26', [54200, 55200, 53200]],
    ['2026-05-28', [59000, 60000, 58000]],
    ['2026-05-29', [65200, 66200, 64200]],
    ['2026-05-30', [74200, 75200, 73200]],
    ['2026-06-01', [67600, 68600, 66600]],
    ['2026-06-02', [59600, 60600, 58600]]
  ].flatMap(([stayDate, prices]) =>
    (prices as number[]).map((priceCents, index) =>
      snapshot({
        snapshotId: `comp-${index + 1}-${String(stayDate).slice(5).replace('-', '')}-ctrip-latest`,
        hotelId: ['comp-lakeview', 'comp-hub', 'comp-garden'][index],
        stayDate: String(stayDate),
        platform: ctrip,
        priceCents
      })
    )
  )
];

const eventDayMovementSnapshots: RateSnapshot[] = [
  snapshot({
    snapshotId: 'comp-lake-0531-ctrip-previous',
    hotelId: 'comp-lakeview',
    stayDate: '2026-05-31',
    platform: ctrip,
    capturedAt: previousCapture,
    priceCents: 65000
  }),
  snapshot({
    snapshotId: 'comp-hub-0531-ctrip-previous',
    hotelId: 'comp-hub',
    stayDate: '2026-05-31',
    platform: ctrip,
    capturedAt: previousCapture,
    priceCents: 66000
  }),
  snapshot({
    snapshotId: 'comp-garden-0531-ctrip-previous',
    hotelId: 'comp-garden',
    stayDate: '2026-05-31',
    platform: ctrip,
    capturedAt: previousCapture,
    priceCents: 67000
  }),
  snapshot({ snapshotId: 'comp-lake-0531-ctrip-latest', hotelId: 'comp-lakeview', stayDate: '2026-05-31', platform: ctrip, priceCents: 76000 }),
  snapshot({ snapshotId: 'comp-hub-0531-ctrip-latest', hotelId: 'comp-hub', stayDate: '2026-05-31', platform: ctrip, priceCents: 78000 }),
  snapshot({ snapshotId: 'comp-garden-0531-ctrip-latest', hotelId: 'comp-garden', stayDate: '2026-05-31', platform: ctrip, priceCents: 79000 })
];

const platformSnapshots: RateSnapshot[] = [
  snapshot({ snapshotId: 'owner-0531-meituan-latest', hotelId: ownerHotelId, stayDate: '2026-05-31', platform: platforms[1], priceCents: 71800 }),
  snapshot({ snapshotId: 'comp-lake-0531-meituan-latest', hotelId: 'comp-lakeview', stayDate: '2026-05-31', platform: platforms[1], priceCents: 74600 }),
  snapshot({ snapshotId: 'comp-hub-0531-meituan-latest', hotelId: 'comp-hub', stayDate: '2026-05-31', platform: platforms[1], priceCents: 75600 }),
  snapshot({ snapshotId: 'comp-garden-0531-meituan-latest', hotelId: 'comp-garden', stayDate: '2026-05-31', platform: platforms[1], priceCents: 73600 }),
  snapshot({ snapshotId: 'owner-0531-fliggy-latest', hotelId: ownerHotelId, stayDate: '2026-05-31', platform: platforms[2], priceCents: 73600 }),
  snapshot({ snapshotId: 'comp-lake-0531-fliggy-latest', hotelId: 'comp-lakeview', stayDate: '2026-05-31', platform: platforms[2], priceCents: 73600 }),
  snapshot({ snapshotId: 'comp-hub-0531-fliggy-latest', hotelId: 'comp-hub', stayDate: '2026-05-31', platform: platforms[2], priceCents: 74600 }),
  snapshot({ snapshotId: 'comp-garden-0531-fliggy-latest', hotelId: 'comp-garden', stayDate: '2026-05-31', platform: platforms[2], priceCents: 72600 }),
  snapshot({ snapshotId: 'owner-0531-tongcheng-latest', hotelId: ownerHotelId, stayDate: '2026-05-31', platform: platforms[3], priceCents: 70800 }),
  snapshot({ snapshotId: 'comp-lake-0531-tongcheng-latest', hotelId: 'comp-lakeview', stayDate: '2026-05-31', platform: platforms[3], priceCents: 76600 }),
  snapshot({ snapshotId: 'comp-hub-0531-tongcheng-latest', hotelId: 'comp-hub', stayDate: '2026-05-31', platform: platforms[3], priceCents: 77600 }),
  snapshot({ snapshotId: 'comp-garden-0531-tongcheng-latest', hotelId: 'comp-garden', stayDate: '2026-05-31', platform: platforms[3], priceCents: 75600 })
];

const events: DemoEventAnnotation[] = [
  { date: '2026-05-29', label: '周末抬升', type: 'weekend', lift: 11, confidence: 'sample' },
  { date: '2026-05-30', label: '端午演示假期', type: 'holiday', lift: 18, confidence: 'sample' },
  { date: '2026-05-31', label: '演唱会演示日', type: 'concert', lift: 22, confidence: 'partial' },
  { date: '2026-06-02', label: '会展演示日', type: 'expo', lift: 9, confidence: 'sample' }
];

export const domainSeed: DomainDemoSeed = {
  hotels,
  snapshots: [...ctripTrendSnapshots, ...eventDayMovementSnapshots, ...platformSnapshots],
  events,
  now: latestCapture,
  platforms,
  context: {
    ownerPropertyId,
    ownerHotelId,
    competitorGroupId,
    propertyName: '西湖商务精选酒店',
    roomTypeKey: 'std-king',
    roomTypeLabel: '标准大床房',
    dateRange: '2026-05-24 至 2026-06-02',
    demandContext: '周末、端午演示假期、会展演示日、演唱会演示日',
    captureLabel: '2026-05-19 09:30',
    platformFocusDate: '2026-05-31'
  }
};
