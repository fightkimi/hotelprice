import { PlatformGapBars } from '../components/charts/PlatformGapBars';
import type { DemoDataset } from '../types/contracts';

interface MarketComparisonScreenProps {
  dataset: DemoDataset;
}

export function MarketComparisonScreen({ dataset }: MarketComparisonScreenProps) {
  return (
    <section className="screen-grid screen-grid--two observatory-screen">
      <PlatformGapBars rows={dataset.platformGaps.rows} maxGap={dataset.platformGaps.maxGap} unit={dataset.platformGaps.unit} />
      <aside className="panel observatory-panel insight-rail">
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">竞品与平台上下文</h2>
            <p className="panel__meta">{dataset.context.competitorGroup}</p>
          </div>
          <span className="demo-badge">演示数据</span>
        </div>
        <div className="table-list">
          {dataset.platformGaps.rows.map((row) => (
            <div className="table-row" key={row.platform}>
              <div>
                <strong>{row.platform}</strong>
                <p className="muted">本酒店 CNY {row.ownerRate} · 核心竞品 CNY {row.coreAverage}</p>
              </div>
              <span className={row.gap === 0 ? 'status-chip' : 'status-chip status-chip--warning'}>
                CNY {row.gap}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
