import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

  it('exposes selected state and calls back when a date cell is clicked', async () => {
    const user = userEvent.setup();
    const handleSelectDate = vi.fn();
    render(<CalendarHeatmap days={demoDataset.heatmap.days} selectedDate="2026-05-31" onSelectDate={handleSelectDate} />);

    const selectedDate = screen.getByRole('gridcell', { name: /05\/31/ });
    const targetDate = screen.getByRole('gridcell', { name: /05\/30/ });

    expect(selectedDate).toHaveAttribute('aria-pressed', 'true');
    expect(targetDate).toHaveAttribute('aria-pressed', 'false');

    await user.click(targetDate);

    expect(handleSelectDate).toHaveBeenCalledWith('2026-05-30');
  });

  it('renders platform gap rows with coverage and zero-gap marker', () => {
    render(<PlatformGapBars rows={demoDataset.platformGaps.rows} maxGap={demoDataset.platformGaps.maxGap} unit="CNY" />);

    expect(screen.getByText(/覆盖率/)).toBeVisible();
    expect(screen.getByText(/CNY 0/)).toBeVisible();
  });

  it('applies Revenue Observatory chart frames without removing semantic markers', () => {
    const { container: trend } = render(<TrendChart data={demoDataset.trend} />);
    expect(trend.querySelector('.chart-frame')).not.toBeNull();
    expect(trend.querySelectorAll('[data-testid="trend-segment"]').length).toBeGreaterThan(0);

    const { container: heatmap } = render(<CalendarHeatmap days={demoDataset.heatmap.days} selectedDate="2026-05-31" />);
    expect(heatmap.querySelector('.chart-frame')).not.toBeNull();
    expect(screen.getByText(/暂无可比样本/)).toBeVisible();

    const { container: platformBars } = render(
      <PlatformGapBars rows={demoDataset.platformGaps.rows} maxGap={demoDataset.platformGaps.maxGap} unit="CNY" />
    );
    expect(platformBars.querySelector('.chart-frame')).not.toBeNull();
    expect(screen.getByText(/CNY 0/)).toBeVisible();
  });
});
