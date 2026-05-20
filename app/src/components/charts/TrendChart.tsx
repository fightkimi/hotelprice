import type { EventMarker, TrendSeries } from '../../types/contracts';

interface TrendChartProps {
  data: {
    series: TrendSeries[];
    events: EventMarker[];
    yAxisUnit: 'CNY';
    sampleSize: number;
  };
}

const width = 720;
const height = 260;
const padding = { top: 24, right: 24, bottom: 44, left: 56 };

function colorValue(token: string) {
  return `var(${token})`;
}

export function TrendChart({ data }: TrendChartProps) {
  const points = data.series.flatMap((series) => series.points).filter((point) => point.value !== null);
  const values = points.map((point) => point.value as number);
  const min = Math.min(...values) - 24;
  const max = Math.max(...values) + 24;
  const dates = data.series[0]?.points.map((point) => point.date) ?? [];
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const xFor = (date: string) => {
    const index = Math.max(dates.indexOf(date), 0);
    return padding.left + (index / Math.max(dates.length - 1, 1)) * innerWidth;
  };

  const yFor = (value: number) => padding.top + (1 - (value - min) / Math.max(max - min, 1)) * innerHeight;

  return (
    <section className="chart-panel trend-chart">
      <div className="chart-panel__header">
        <div>
          <h2 className="panel__title">价格趋势</h2>
          <p className="panel__meta">样本 {data.sampleSize} · 缺失点以断线展示</p>
        </div>
        <span className="status-chip">断线保留</span>
      </div>
      <svg className="trend-chart__svg" role="img" aria-label="价格趋势图" viewBox={`0 0 ${width} ${height}`}>
        {[0, 1, 2, 3].map((tick) => {
          const y = padding.top + (tick / 3) * innerHeight;
          return <line key={tick} x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-grid-line" />;
        })}
        {data.series.map((series) => {
          const segments = series.points.slice(1).flatMap((point, index) => {
            const previous = series.points[index];
            if (previous.value === null || point.value === null) return [];
            return [
              <line
                key={`${series.id}-${previous.date}-${point.date}`}
                data-testid="trend-segment"
                x1={xFor(previous.date)}
                x2={xFor(point.date)}
                y1={yFor(previous.value)}
                y2={yFor(point.value)}
                stroke={colorValue(series.colorVar)}
                strokeWidth="3"
                strokeLinecap="round"
              />
            ];
          });

          return (
            <g key={series.id}>
              {segments}
              {series.points.map((point) =>
                point.value === null ? (
                  <g key={`${series.id}-${point.date}-gap`}>
                    <circle cx={xFor(point.date)} cy={height - padding.bottom - 4} r="4" className="chart-gap-dot" />
                  </g>
                ) : (
                  <circle
                    key={`${series.id}-${point.date}`}
                    cx={xFor(point.date)}
                    cy={yFor(point.value)}
                    r="4"
                    fill="var(--color-surface)"
                    stroke={colorValue(series.colorVar)}
                    strokeWidth="2"
                  />
                )
              )}
            </g>
          );
        })}
        {data.events.map((event) => (
          <g key={event.date}>
            <line x1={xFor(event.date)} x2={xFor(event.date)} y1={padding.top} y2={height - padding.bottom} className="event-marker-line" />
            <text x={xFor(event.date)} y={padding.top + 12} textAnchor="middle" className="chart-annotation">
              {event.label}
            </text>
          </g>
        ))}
        {dates.map((date, index) =>
          index % 3 === 0 || index === dates.length - 1 ? (
            <text key={date} x={xFor(date)} y={height - 14} textAnchor="middle" className="chart-axis-label">
              {date.slice(5)}
            </text>
          ) : null
        )}
      </svg>
      <div className="chart-legend">
        {data.series.map((series) => (
          <span key={series.id} className="chart-legend__item">
            <span className="chart-legend__swatch" style={{ background: colorValue(series.colorVar) }} />
            {series.label}
          </span>
        ))}
        <span className="chart-legend__item chart-legend__item--gap">数据缺口</span>
      </div>
    </section>
  );
}
