import type { DemoDataset } from '../types/contracts';
import type { CaptureEntryStatus } from '../types/contracts';

interface SetupDataScopeScreenProps {
  dataset: DemoDataset;
}

const statusLabel = {
  active: '当前使用',
  available: '可进入复核',
  'requires-approval': '需完成授权',
  blocked: '暂不可用'
} satisfies Record<CaptureEntryStatus, string>;

const sourceKindLabel = {
  fixture: '演示样本',
  manual: '手工整理',
  approved_api: '批准来源'
} as const;

function joinValues(values: Array<string | number>): string {
  return values.map(String).join(' / ');
}

export function SetupDataScopeScreen({ dataset }: SetupDataScopeScreenProps) {
  const { captureEntry, dataScope } = dataset;
  const scopeItems = [
    ['酒店档案', `${dataScope.ownerHotelName} · ${dataScope.ownerHotelId}`],
    ['竞品范围', dataScope.competitorGroupLabel],
    ['覆盖样本', `${dataScope.competitorCoverage.coreCount} 家核心 / ${dataScope.competitorCoverage.referenceCount} 家参考`],
    ['入住日期', `${dataScope.stayWindow.startDate} 至 ${dataScope.stayWindow.endDate} · ${dataScope.stayWindow.totalStayDates} 晚`],
    ['房型范围', joinValues(dataScope.rateBasis.roomTypes)],
    ['税费口径', dataScope.rateBasis.taxFeeBasis.includes('included') ? '含税含服务费' : joinValues(dataScope.rateBasis.taxFeeBasis)],
    ['入住人数', `${joinValues(dataScope.rateBasis.occupancyAdults)} 位成人`],
    ['新鲜度规则', `${dataScope.freshness.staleAfterHours} 小时后标记为过期样本`]
  ] as const;

  return (
    <section className="screen-grid screen-grid--two setup-observatory observatory-screen" data-visual-system="revenue-observatory">
      <div className="panel observatory-glass-panel observatory-panel">
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">数据范围</h2>
            <p className="panel__meta">按酒店、竞品、平台、日期和价格口径限定分析边界。</p>
          </div>
          <span className="demo-badge">演示数据</span>
        </div>
        <div className="scope-observatory-map" aria-label="数据范围观测图">
          <div className="scope-grid">
            {scopeItems.map(([label, value]) => (
              <div className="setup-item scope-metric-cell" key={label}>
                <span className="meta-label">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="scope-signal-axis" aria-hidden="true" />
          <div className="platform-scope-list">
            {dataScope.platforms.map((platform) => (
              <div className="platform-scope-row scope-orbit-node" key={platform.sourceId}>
                <div className="platform-scope-row__top">
                  <strong>{platform.label}</strong>
                  <span className="status-chip">{platform.enabled ? '已纳入范围' : '未启用'}</span>
                </div>
                <p className="panel__meta">
                  {sourceKindLabel[platform.sourceKind]} · {platform.channel} · {platform.sourceId}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="panel observatory-glass-panel observatory-panel">
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">采集入口</h2>
            <p className="panel__meta">当前只展示入口状态，生产连接保持关闭。</p>
          </div>
        </div>
        <div className="stack">
          <p>{dataset.demoDisclosure}</p>
          <div className="setup-item">
            <span className="meta-label">生产连接</span>
            <strong>{captureEntry.productionConnectionEnabled ? '已开启' : '当前关闭'}</strong>
          </div>
          <div className="capture-entry-list capture-signal-rail">
            {captureEntry.options.map((option) => (
              <div className="capture-entry-row" key={option.id}>
                <div className="capture-entry-row__top">
                  <strong>{option.label}</strong>
                  <span className="status-chip">{statusLabel[option.status]}</span>
                </div>
                <p className="panel__meta">
                  {sourceKindLabel[option.sourceKind]} · {option.description}
                </p>
                <div className="cluster">
                  {option.humanReviewRequired ? <span className="status-chip status-chip--review">人工复核</span> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="setup-item">
            <span className="meta-label">边界说明</span>
            <strong>{captureEntry.policyNotes.join(' / ')}</strong>
          </div>
        </div>
      </aside>
    </section>
  );
}
