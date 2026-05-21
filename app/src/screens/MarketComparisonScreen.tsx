import { useMemo, useState } from 'react';
import { PlatformGapBars } from '../components/charts/PlatformGapBars';
import type { DemoDataset, MarketCompetitorSample, MarketDrilldownDetail, MarketDrilldownOption } from '../types/contracts';

interface MarketComparisonScreenProps {
  dataset: DemoDataset;
  detailOpen?: boolean;
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

function formatRange(detail: MarketDrilldownDetail): string {
  return detail.competitorRange === null ? '暂无可比样本' : `CNY ${detail.competitorRange.min} - ${detail.competitorRange.max}`;
}

function DrilldownOptionButton({
  option,
  selected,
  onSelect
}: {
  option: MarketDrilldownOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button className="market-option-button" type="button" aria-pressed={selected} data-selected={selected} onClick={() => onSelect(option.id)}>
      <span>
        <strong>{option.label}</strong>
        <small>
          {option.roomType} · {option.eventLabel}
        </small>
      </span>
      <span className={option.status === 'available' ? 'status-chip' : 'status-chip status-chip--warning'}>{formatGap(option.gap)}</span>
    </button>
  );
}

function CompetitorSampleRow({ sample }: { sample: MarketCompetitorSample }) {
  return (
    <div className="market-sample-row" data-status={sample.status}>
      <div>
        <strong>{sample.hotelName}</strong>
        <small>
          {sample.source} · {formatCaptureTime(sample.captureTime)}
        </small>
      </div>
      <div className="market-sample-row__rate">
        <span>{formatRate(sample.price)}</span>
        <span className="status-chip">{sample.statusLabel}</span>
      </div>
      <small>{sample.explanation}</small>
    </div>
  );
}

export function MarketComparisonScreen({ dataset, detailOpen = true }: MarketComparisonScreenProps) {
  const options = dataset.marketDrilldown.options;
  const initialOptionId = dataset.marketDrilldown.byId[dataset.marketDrilldown.selectedOptionId]
    ? dataset.marketDrilldown.selectedOptionId
    : (options[0]?.id ?? '');
  const [selectedOptionId, setSelectedOptionId] = useState(initialOptionId);
  const selected = useMemo(
    () => dataset.marketDrilldown.byId[selectedOptionId] ?? dataset.marketDrilldown.byId[initialOptionId],
    [dataset.marketDrilldown.byId, initialOptionId, selectedOptionId]
  );

  if (!selected) {
    return (
      <section className="screen-grid screen-grid--two observatory-screen">
        <PlatformGapBars rows={dataset.platformGaps.rows} maxGap={dataset.platformGaps.maxGap} unit={dataset.platformGaps.unit} />
        <aside className="panel observatory-panel insight-rail">
          <p className="muted">暂无市场价差详情。</p>
        </aside>
      </section>
    );
  }

  return (
    <section className="screen-grid screen-grid--two observatory-screen market-drilldown-screen">
      <div className="stack">
        <PlatformGapBars rows={dataset.platformGaps.rows} maxGap={dataset.platformGaps.maxGap} unit={dataset.platformGaps.unit} />
        <section className="panel observatory-panel market-option-panel" aria-label="市场价差下钻组合">
          <div className="panel__header instrument-header">
            <div>
              <h2 className="panel__title">下钻组合</h2>
              <p className="panel__meta">按平台、日期和房型查看可比样本</p>
            </div>
            <span className="demo-badge">演示数据</span>
          </div>
          <div className="market-option-list">
            {options.map((option) => (
              <DrilldownOptionButton key={option.id} option={option} selected={option.id === selected.id} onSelect={setSelectedOptionId} />
            ))}
          </div>
        </section>
      </div>

      <aside
        className="panel observatory-panel insight-rail detail-panel market-detail-panel"
        data-state={detailOpen ? 'open' : 'closed'}
        data-testid="market-drilldown-detail"
      >
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">竞品价差详情</h2>
            <p className="panel__meta">
              {selected.platform} · {selected.stayDate} · {selected.roomType}
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
            <span className="meta-label">核心竞品价格区间</span>
            <strong>{formatRange(selected)}</strong>
            <small>
              覆盖率 {formatCoverage(selected.coverage)} · 样本 {selected.sampleSize} 条
            </small>
          </div>

          {selected.missingSampleReason ? <p className="calendar-detail-warning">{selected.missingSampleReason}</p> : null}

          <section className="market-detail-section" aria-label="竞品样本">
            <h3>竞品样本</h3>
            <div className="market-sample-list">
              {selected.competitorSamples.map((sample) => (
                <CompetitorSampleRow key={sample.hotelId} sample={sample} />
              ))}
            </div>
          </section>

          <section className="market-detail-section" aria-label="采集时间和价格口径">
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

          <section className="market-detail-section" aria-label="证据来源">
            <h3>证据来源</h3>
            <div className="calendar-evidence-list">
              {selected.evidenceMarkers.map((marker) => (
                <div className="calendar-evidence-row" key={`${marker.label}-${marker.source}-${marker.captureTime}`}>
                  <strong>{marker.label}</strong>
                  <small>
                    {marker.source} · {formatCaptureTime(marker.captureTime)} · 样本 {marker.sampleSize} 条
                  </small>
                </div>
              ))}
            </div>
          </section>

          <p className="muted">{dataset.marketDrilldown.guardrails.join(' ')}</p>
        </div>
      </aside>
    </section>
  );
}
