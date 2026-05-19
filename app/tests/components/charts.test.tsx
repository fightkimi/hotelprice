import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CalendarHeatmap } from '../../src/components/charts/CalendarHeatmap';
import { PlatformGapBars } from '../../src/components/charts/PlatformGapBars';
import { TrendChart } from '../../src/components/charts/TrendChart';
import { demoDataset } from '../../src/data/demoDataset';

describe('chart primitives', () => {
  it('renders trend line segments and preserves missing data as gaps', () => {
    render(<TrendChart data={demoDataset.trend} />);

    expect(screen.getByRole('img', { name: /价格趋势/ })).toBeVisible();
    expect(screen.getAllByTestId('trend-segment').length).toBeGreaterThan(0);
    expect(screen.getByText(/数据缺口/)).toBeVisible();
  });

  it('renders unavailable heatmap days without treating them as zero', () => {
    render(<CalendarHeatmap days={demoDataset.heatmap.days} selectedDate="2026-05-31" />);

    expect(screen.getByText(/暂无可比样本/)).toBeVisible();
    expect(screen.getByRole('grid')).toBeVisible();
  });

  it('renders platform gap rows with coverage and zero-gap marker', () => {
    render(<PlatformGapBars rows={demoDataset.platformGaps.rows} maxGap={demoDataset.platformGaps.maxGap} unit="CNY" />);

    expect(screen.getByText(/覆盖率/)).toBeVisible();
    expect(screen.getByText(/CNY 0/)).toBeVisible();
  });
});
