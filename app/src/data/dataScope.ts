import type { CaptureEntryPreview, DataScopeSummary } from '../types/contracts';
import type { DomainDemoSeed } from './domainSeed';

const staleAfterHours = 36;

function uniqueSorted<T extends string | number>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

function sourceKindForSource(seed: DomainDemoSeed, sourceId: string): DataScopeSummary['platforms'][number]['sourceKind'] {
  const kinds = new Set(seed.snapshots.filter((snapshot) => snapshot.rateKey.sourceId === sourceId).map((snapshot) => snapshot.sourceKind));
  if (kinds.has('manual')) {
    return 'manual';
  }
  if (kinds.has('approved_api')) {
    return 'approved_api';
  }
  return 'fixture';
}

export function buildDataScopeSummary(seed: DomainDemoSeed): DataScopeSummary {
  const owner = seed.hotels.find((hotel) => hotel.role === 'owner' && hotel.active);
  if (!owner) {
    throw new Error('Data scope requires one active owner hotel.');
  }

  const activeCompetitors = seed.hotels.filter((hotel) => hotel.role === 'competitor' && hotel.active);
  const stayDates = uniqueSorted(seed.snapshots.map((snapshot) => snapshot.rateKey.stayDate));
  if (stayDates.length === 0) {
    throw new Error('Data scope requires at least one stay date.');
  }

  const rateKeys = seed.snapshots.map((snapshot) => snapshot.rateKey);

  return {
    ownerPropertyId: seed.context.ownerPropertyId,
    ownerHotelId: seed.context.ownerHotelId,
    ownerHotelName: owner.name,
    competitorGroupId: seed.context.competitorGroupId,
    competitorGroupLabel: '核心竞品组 A：同商圈中高端酒店',
    competitorCoverage: {
      coreCount: activeCompetitors.filter((hotel) => hotel.competitorLevel === 'core').length,
      referenceCount: activeCompetitors.filter((hotel) => hotel.competitorLevel === 'reference').length,
      activeHotelIds: activeCompetitors.map((hotel) => hotel.hotelId)
    },
    platforms: seed.platforms.map((platform) => ({
      label: platform.label,
      channel: platform.channel,
      sourceId: platform.sourceId,
      sourceKind: sourceKindForSource(seed, platform.sourceId),
      enabled: true
    })),
    stayWindow: {
      startDate: stayDates[0],
      endDate: stayDates[stayDates.length - 1],
      totalStayDates: stayDates.length,
      focusDate: seed.context.platformFocusDate
    },
    rateBasis: {
      currency: 'CNY',
      occupancyAdults: uniqueSorted(rateKeys.map((rateKey) => rateKey.occupancyAdults)),
      roomTypes: [seed.context.roomTypeLabel],
      mealPlans: uniqueSorted(rateKeys.map((rateKey) => rateKey.mealPlan)),
      cancellationPolicies: uniqueSorted(rateKeys.map((rateKey) => rateKey.cancellationPolicy)),
      taxFeeBasis: uniqueSorted(rateKeys.map((rateKey) => rateKey.taxFeeBasis))
    },
    freshness: {
      currentCaptureTime: seed.now,
      staleAfterHours
    },
    guardrails: ['演示样本', '人工复核', '生产连接关闭', '按房型与税费口径比较']
  };
}

export function buildCaptureEntryPreview(): CaptureEntryPreview {
  return {
    productionConnectionEnabled: false,
    activeEntryId: 'fixture-demo',
    options: [
      {
        id: 'fixture-demo',
        label: '当前演示样本',
        sourceKind: 'fixture',
        status: 'active',
        description: '使用本地样例数据展示范围、覆盖率和复核入口。',
        humanReviewRequired: true
      },
      {
        id: 'manual-import',
        label: '手工导入预览',
        sourceKind: 'manual',
        status: 'available',
        description: '用于后续接收人工整理的数据表，并进入人工复核。',
        humanReviewRequired: true
      },
      {
        id: 'approved-api',
        label: '批准接口预览',
        sourceKind: 'approved_api',
        status: 'requires-approval',
        description: '仅在完成授权与速率规则后开放，当前不连接真实平台。',
        humanReviewRequired: true
      }
    ],
    policyNotes: ['不连接真实平台', '不保存生产账号', '不执行价格动作', '所有结果进入人工复核']
  };
}
