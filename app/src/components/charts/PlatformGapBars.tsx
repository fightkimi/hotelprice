import type { PlatformGapRow } from '../../types/contracts';

interface PlatformGapBarsProps {
  rows: PlatformGapRow[];
  maxGap: number;
  unit: 'CNY';
}

export function PlatformGapBars({ rows, maxGap, unit }: PlatformGapBarsProps) {
  return (
    <section className="chart-panel platform-bars chart-frame observatory-panel">
      <div className="chart-panel__header">
        <div>
          <h2 className="panel__title">跨平台价差</h2>
          <p className="panel__meta">平台覆盖与价差同时用于判断样本质量</p>
        </div>
        <span className="status-chip">覆盖率</span>
      </div>
      <div className="platform-bars__list">
        {rows.map((row) => {
          const magnitude = Math.min(100, Math.round((Math.abs(row.gap) / Math.max(maxGap, 1)) * 100));
          return (
            <div className="platform-row" key={row.platform}>
              <div className="platform-row__header">
                <strong>{row.platform}</strong>
                <span>覆盖 {Math.round(row.coverage * 100)}%</span>
              </div>
              <div className="platform-row__track" aria-label={`${row.platform} 价差 ${unit} ${row.gap}`}>
                <span className="platform-row__zero" />
                <span
                  className="platform-row__bar"
                  data-direction={row.gap < 0 ? 'lower' : row.gap > 0 ? 'higher' : 'same'}
                  style={{ width: `${Math.max(magnitude, row.gap === 0 ? 2 : 8)}%` }}
                />
              </div>
              <div className="platform-row__meta">
                <span>本酒店 CNY {row.ownerRate}</span>
                <strong>
                  {unit} {row.gap}
                </strong>
                <span>竞品均价 CNY {row.coreAverage}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
