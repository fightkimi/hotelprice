import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import type { CalendarDayDetail, CalendarPlatformGapRow, DemoDataset, EvidenceMarker } from '../types/contracts';
import { useMemo, useState } from 'react';

interface CalendarScreenProps {
  dataset: DemoDataset;
  detailOpen: boolean;
}

function formatRate(value: number | null): string {
  return value === null ? '暂无可比样本' : `CNY ${value}`;
}

function formatGap(value: number | null): string {
  if (value === null) {
    return '缺少可比样本';
  }
  if (value === 0) {
    return 'CNY 0';
  }
  return value > 0 ? `高于竞品 CNY ${Math.abs(value)}` : `低于竞品 CNY ${Math.abs(value)}`;
}

function formatCaptureTime(value: string | null): string {
  return value ? value.replace('T', ' ').slice(0, 16) : '暂无采集时间';
}

function formatCoverage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function eventImpactText(detail: CalendarDayDetail): string {
  if (detail.eventImpact.type === 'normal') {
    return '无明显事件抬升';
  }
  return `事件影响 +${detail.eventImpact.lift} · ${detail.eventImpact.confidence === 'sample' ? '样本较完整' : '样本待补充'}`;
}

function PlatformGapDetailRow({ row }: { row: CalendarPlatformGapRow }) {
  return (
    <div className="calendar-platform-row" data-status={row.status}>
      <div>
        <span className="meta-label">{row.platform}</span>
        <strong>{formatGap(row.gap)}</strong>
      </div>
      <div className="calendar-platform-row__rates">
        <span>{formatRate(row.ownerRate)}</span>
        <span>{formatRate(row.coreAverage)}</span>
      </div>
      <small>
        覆盖率 {formatCoverage(row.coverage)} · 样本 {row.sampleSize} 条 · {formatCaptureTime(row.captureTime)}
      </small>
    </div>
  );
}

function EvidenceDetailRow({ marker }: { marker: EvidenceMarker }) {
  return (
    <div className="calendar-evidence-row" data-confidence={marker.confidence}>
      <strong>{marker.label}</strong>
      <small>
        {marker.source} · {formatCaptureTime(marker.captureTime)} · 样本 {marker.sampleSize} 条
      </small>
    </div>
  );
}

export function CalendarScreen({ dataset, detailOpen }: CalendarScreenProps) {
  const detailDates = useMemo(() => Object.keys(dataset.calendarDetails.byDate), [dataset.calendarDetails.byDate]);
  const initialDate = dataset.calendarDetails.byDate[dataset.dataScope.stayWindow.focusDate]
    ? dataset.dataScope.stayWindow.focusDate
    : (detailDates[0] ?? '');
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const selected = dataset.calendarDetails.byDate[selectedDate] ?? dataset.calendarDetails.byDate[detailDates[0]];

  if (!selected) {
    return (
      <section className="screen-grid screen-grid--two observatory-screen">
        <CalendarHeatmap days={dataset.heatmap.days} />
        <aside className="panel detail-panel observatory-panel insight-rail" data-state={detailOpen ? 'open' : 'closed'}>
          <p className="muted">暂无日期详情。</p>
        </aside>
      </section>
    );
  }

  return (
    <section className="screen-grid screen-grid--two observatory-screen">
      <CalendarHeatmap days={dataset.heatmap.days} selectedDate={selected.stayDate} onSelectDate={setSelectedDate} />
      <aside
        className="panel detail-panel observatory-panel insight-rail"
        data-state={detailOpen ? 'open' : 'closed'}
        data-testid="calendar-detail-panel"
      >
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">日期详情</h2>
            <p className="panel__meta">
              {selected.stayDate} · {selected.eventImpact.label}
            </p>
          </div>
          <span className="status-chip status-chip--review">需人工复核</span>
        </div>
        <div className="stack">
          <div className="detail-metric">
            <span className="meta-label">本酒店价</span>
            <strong>{formatRate(selected.ownerRate)}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">核心竞品均价</span>
            <strong>{formatRate(selected.coreAverage)}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">平台价差</span>
            <strong>{formatGap(selected.gap)}</strong>
          </div>
          <div className="detail-metric">
            <span className="meta-label">事件影响</span>
            <strong>{selected.eventImpact.label}</strong>
            <small>{eventImpactText(selected)}</small>
          </div>
          <div className="detail-metric">
            <span className="meta-label">样本</span>
            <strong>{selected.sampleSize} 条</strong>
          </div>
          {selected.missingSampleReason ? <p className="calendar-detail-warning">{selected.missingSampleReason}</p> : null}

          <section className="calendar-detail-section" aria-label="平台价差明细">
            <h3>平台价差</h3>
            <div className="calendar-platform-list">
              {selected.platformGaps.map((row) => (
                <PlatformGapDetailRow key={row.platform} row={row} />
              ))}
            </div>
          </section>

          <section className="calendar-detail-section" aria-label="证据来源">
            <h3>证据来源</h3>
            <div className="calendar-evidence-list">
              {selected.evidenceMarkers.map((marker) => (
                <EvidenceDetailRow key={`${marker.label}-${marker.source}-${marker.captureTime}`} marker={marker} />
              ))}
            </div>
          </section>

          <section className="calendar-detail-section" aria-label="采集时间和价格口径">
            <h3>采集时间</h3>
            <div className="calendar-rate-basis">
              <span>{formatCaptureTime(selected.captureTime)}</span>
              <span>
                {selected.rateBasis.roomType} · {selected.rateBasis.occupancy} 成人 · {selected.rateBasis.mealPlan}
              </span>
              <span>
                {selected.rateBasis.taxFeeBasis} · {selected.rateBasis.cancellationPolicy}
              </span>
            </div>
          </section>

          <p className="muted">该日期价格差异仅作为复核线索，需要结合房态、取消政策和库存策略人工判断。</p>
        </div>
      </aside>
    </section>
  );
}
