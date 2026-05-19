import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import type { DemoDataset } from '../types/contracts';

interface CalendarScreenProps {
  dataset: DemoDataset;
  detailOpen: boolean;
}

export function CalendarScreen({ dataset, detailOpen }: CalendarScreenProps) {
  const selectedDate = '2026-05-31';
  const selected = dataset.heatmap.days.find((day) => day.date === selectedDate) ?? dataset.heatmap.days[0];

  return (
    <section className="screen-grid screen-grid--two">
      <CalendarHeatmap days={dataset.heatmap.days} selectedDate={selected.date} />
      <aside className="panel detail-panel" data-state={detailOpen ? 'open' : 'closed'}>
        <div className="panel__header">
          <div>
            <h2 className="panel__title">日期详情</h2>
            <p className="panel__meta">{selected.date}</p>
          </div>
          <span className="status-chip status-chip--review">需人工复核</span>
        </div>
        <div className="stack">
          <div className="detail-metric">
            <span className="meta-label">本酒店价</span>
            <strong>CNY {selected.ownerRate}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">核心竞品均价</span>
            <strong>CNY {selected.coreAverage}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">事件</span>
            <strong>{selected.eventLabel ?? '普通工作日'}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">样本</span>
            <strong>{selected.sampleSize} 条</strong>
          </div>
          <p className="muted">该日期价格差异仅作为复核线索，需要结合房态、取消政策和库存策略人工判断。</p>
        </div>
      </aside>
    </section>
  );
}
