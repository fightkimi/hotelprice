import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { CalendarScreen } from '../../src/screens/CalendarScreen';

describe('CalendarScreen date detail workflow', () => {
  it('updates the detail rail when an available event date is selected', async () => {
    const user = userEvent.setup();
    render(<CalendarScreen dataset={demoDataset} detailOpen />);

    const detail = screen.getByTestId('calendar-detail-panel');
    expect(detail).toHaveTextContent('2026-05-31');
    expect(detail).toHaveTextContent('演唱会演示日');

    await user.click(screen.getByRole('gridcell', { name: /05\/30/ }));

    expect(detail).toHaveTextContent('2026-05-30');
    expect(detail).toHaveTextContent('端午演示假期');
    expect(detail).toHaveTextContent('平台价差');
    expect(detail).toHaveTextContent('证据来源');
    expect(detail).toHaveTextContent('采集时间');
    expect(detail).toHaveTextContent('含税含服务费');
    expect(detail).toHaveTextContent('需人工复核');
    expect(within(detail).getAllByText(/携程演示源/).length).toBeGreaterThan(0);
  });

  it('shows missing sample detail without rendering zero or null prices', async () => {
    const user = userEvent.setup();
    render(<CalendarScreen dataset={demoDataset} detailOpen />);

    const detail = screen.getByTestId('calendar-detail-panel');
    await user.click(screen.getByRole('gridcell', { name: /05\/27/ }));

    expect(detail).toHaveTextContent('2026-05-27');
    expect(detail).toHaveTextContent('暂无可比样本，需要等待人工导入或获授权来源补充。');
    expect(detail).toHaveTextContent('缺少可比样本');
    expect(detail).not.toHaveTextContent('CNY null');
    expect(detail).not.toHaveTextContent('CNY 0');
  });
});
