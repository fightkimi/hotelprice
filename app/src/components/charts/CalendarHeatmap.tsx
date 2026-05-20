import type { HeatmapDay } from '../../types/contracts';
import type { CSSProperties } from 'react';

interface CalendarHeatmapProps {
  days: HeatmapDay[];
  selectedDate?: string;
}

function clampIntensity(value: number | null) {
  if (value === null) return null;
  return Math.min(1, Math.max(0, value));
}

export function CalendarHeatmap({ days, selectedDate }: CalendarHeatmapProps) {
  return (
    <section className="chart-panel calendar-heatmap chart-frame observatory-panel">
      <div className="chart-panel__header">
        <div>
          <h2 className="panel__title">未来价格热力日历</h2>
          <p className="panel__meta">颜色深浅表示事件影响和价差波动强弱</p>
        </div>
        <span className="status-chip">演示数据</span>
      </div>
      <div className="heatmap-grid" role="grid" aria-label="价格热力日历">
        {days.map((day) => {
          const intensity = clampIntensity(day.intensity);
          const selected = day.date === selectedDate;
          return (
            <button
              className="heatmap-cell"
              type="button"
              role="gridcell"
              key={day.date}
              data-status={day.status}
              data-selected={selected ? 'true' : 'false'}
              style={
                intensity === null
                  ? undefined
                  : {
                      '--heat': String(intensity)
                    } as CSSProperties
              }
            >
              <span className="heatmap-cell__date">{day.label}</span>
              {day.status === 'unavailable' ? (
                <span className="heatmap-cell__unavailable">暂无可比样本</span>
              ) : (
                <>
                  <span className="heatmap-cell__rate">CNY {day.ownerRate}</span>
                  <span className="heatmap-cell__meta">{day.eventLabel ?? '普通工作日'}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
