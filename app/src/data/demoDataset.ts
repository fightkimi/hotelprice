import type { DemoDataset, PricePoint, RateKey } from '../types/contracts';

const baseRateKey = {
  hotelId: 'hotel-demo-westlake-001',
  competitorGroupId: 'core-comp-demo-01',
  roomType: '标准大床房',
  platform: '携程演示源',
  occupancy: 2,
  mealPlan: '双早',
  taxFeeBasis: '含税含服务费',
  cancellationPolicy: '入住前24小时可取消'
} satisfies Omit<RateKey, 'stayDate'>;

function point(date: string, value: number | null, platform = baseRateKey.platform): PricePoint {
  return {
    date,
    value,
    currency: 'CNY',
    captureTime: '2026-05-19 09:30',
    rateKey: {
      ...baseRateKey,
      platform,
      stayDate: date
    },
    occupancy: baseRateKey.occupancy,
    mealPlan: baseRateKey.mealPlan,
    taxFeeBasis: baseRateKey.taxFeeBasis,
    cancellationPolicy: baseRateKey.cancellationPolicy
  };
}

export const demoDataset = {
  sourceKind: 'fixture-demo',
  liveCollectionEnabled: false,
  demoDisclosure: '演示数据：本页仅使用静态样例，不连接真实平台或客户系统。',
  context: {
    property: '西湖商务精选酒店',
    roomType: '标准大床房',
    platform: '携程 / 美团 / 飞猪 / 同程演示源',
    dateRange: '2026-05-24 至 2026-06-22',
    competitorGroup: '核心竞品组 A：同商圈中高端酒店',
    demandContext: '周末、端午演示假期、会展演示日',
    captureTime: '2026-05-19 09:30'
  },
  trend: {
    yAxisUnit: 'CNY',
    sampleSize: 92,
    series: [
      {
        id: 'owner-rate',
        label: '本酒店价',
        colorToken: '--color-teal',
        points: [
          point('2026-05-24', 528),
          point('2026-05-25', 518),
          point('2026-05-26', 520),
          point('2026-05-27', null),
          point('2026-05-28', 552),
          point('2026-05-29', 618),
          point('2026-05-30', 698),
          point('2026-05-31', 728),
          point('2026-06-01', 638),
          point('2026-06-02', 568)
        ]
      },
      {
        id: 'core-average',
        label: '核心竞品均价',
        colorToken: '--color-violet',
        points: [
          point('2026-05-24', 548, '核心竞品均价'),
          point('2026-05-25', 536, '核心竞品均价'),
          point('2026-05-26', 542, '核心竞品均价'),
          point('2026-05-27', 556, '核心竞品均价'),
          point('2026-05-28', 590, '核心竞品均价'),
          point('2026-05-29', 652, '核心竞品均价'),
          point('2026-05-30', 742, '核心竞品均价'),
          point('2026-05-31', 760, '核心竞品均价'),
          point('2026-06-01', 676, '核心竞品均价'),
          point('2026-06-02', 596, '核心竞品均价')
        ]
      },
      {
        id: 'event-lift',
        label: '事件影响指数',
        colorToken: '--color-amber',
        points: [
          point('2026-05-24', 500, '事件样本'),
          point('2026-05-25', 500, '事件样本'),
          point('2026-05-26', 508, '事件样本'),
          point('2026-05-27', 516, '事件样本'),
          point('2026-05-28', 558, '事件样本'),
          point('2026-05-29', 632, '事件样本'),
          point('2026-05-30', 722, '事件样本'),
          point('2026-05-31', 748, '事件样本'),
          point('2026-06-01', 620, '事件样本'),
          point('2026-06-02', 530, '事件样本')
        ]
      }
    ],
    events: [
      { date: '2026-05-30', label: '端午演示假期', type: 'holiday', lift: 18, confidence: 'sample' },
      { date: '2026-05-31', label: '演唱会演示日', type: 'concert', lift: 22, confidence: 'partial' },
      { date: '2026-06-02', label: '会展演示日', type: 'expo', lift: 9, confidence: 'sample' }
    ]
  },
  heatmap: {
    days: [
      { date: '2026-05-24', label: '5/24', intensity: 0.26, coreAverage: 548, ownerRate: 528, sampleSize: 8, status: 'normal' },
      { date: '2026-05-25', label: '5/25', intensity: 0.18, coreAverage: 536, ownerRate: 518, sampleSize: 7, status: 'normal' },
      { date: '2026-05-26', label: '5/26', intensity: 0.22, coreAverage: 542, ownerRate: 520, sampleSize: 8, status: 'normal' },
      { date: '2026-05-27', label: '5/27', intensity: null, coreAverage: null, ownerRate: null, sampleSize: 0, status: 'unavailable' },
      { date: '2026-05-28', label: '5/28', intensity: 0.36, coreAverage: 590, ownerRate: 552, sampleSize: 9, status: 'normal' },
      { date: '2026-05-29', label: '5/29', intensity: 0.58, coreAverage: 652, ownerRate: 618, eventLabel: '周末抬升', sampleSize: 11, status: 'event-lift' },
      { date: '2026-05-30', label: '5/30', intensity: 0.88, coreAverage: 742, ownerRate: 698, eventLabel: '端午演示假期', sampleSize: 13, status: 'event-lift' },
      { date: '2026-05-31', label: '5/31', intensity: 0.95, coreAverage: 760, ownerRate: 728, eventLabel: '演唱会演示日', sampleSize: 12, status: 'event-lift' },
      { date: '2026-06-01', label: '6/1', intensity: 0.62, coreAverage: 676, ownerRate: 638, eventLabel: '假期尾日', sampleSize: 10, status: 'event-lift' },
      { date: '2026-06-02', label: '6/2', intensity: 0.42, coreAverage: 596, ownerRate: 568, eventLabel: '会展演示日', sampleSize: 9, status: 'event-lift' }
    ]
  },
  platformGaps: {
    unit: 'CNY',
    maxGap: 58,
    rows: [
      { platform: '携程演示源', ownerRate: 728, coreAverage: 760, gap: -32, coverage: 0.92 },
      { platform: '美团演示源', ownerRate: 718, coreAverage: 746, gap: -28, coverage: 0.86 },
      { platform: '飞猪演示源', ownerRate: 736, coreAverage: 736, gap: 0, coverage: 0.78 },
      { platform: '同程演示源', ownerRate: 708, coreAverage: 766, gap: -58, coverage: 0.71 }
    ]
  },
  signals: [
    {
      id: 'holiday-gap',
      title: '端午假期价差扩大',
      primaryMetric: -32,
      metricUnit: 'CNY',
      summary: '5/30 至 5/31 本酒店价低于核心竞品均价，建议进入人工复核队列。',
      severity: 'warning',
      humanReviewRequired: true,
      evidenceMarkers: [
        { label: '节假日样本', source: '携程演示源', captureTime: '2026-05-19 09:30', sampleSize: 13, confidence: 'sample' }
      ]
    },
    {
      id: 'concert-demand',
      title: '演唱会日需求抬升',
      primaryMetric: 22,
      metricUnit: '%',
      summary: '事件样本显示 5/31 需求强度高于普通工作日，需要结合房态人工判断。',
      severity: 'risk',
      humanReviewRequired: true,
      evidenceMarkers: [
        { label: '事件样本', source: '美团演示源', captureTime: '2026-05-19 09:30', sampleSize: 12, confidence: 'partial' }
      ]
    },
    {
      id: 'platform-coverage',
      title: '同程样本覆盖偏低',
      primaryMetric: 71,
      metricUnit: '%',
      summary: '同程演示源覆盖率低于其他平台，价差结论需结合样本质量人工确认。',
      severity: 'softness',
      humanReviewRequired: true,
      evidenceMarkers: [
        { label: '平台覆盖', source: '同程演示源', captureTime: '2026-05-19 09:30', sampleSize: 9, confidence: 'partial' }
      ]
    }
  ]
} satisfies DemoDataset;
