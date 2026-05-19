import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ContextRibbon } from '../../src/components/layout/ContextRibbon';
import { demoDataset } from '../../src/data/demoDataset';

describe('ContextRibbon', () => {
  it('renders all F-006 context fields as visible read-only selector controls', async () => {
    const user = userEvent.setup();
    render(<ContextRibbon context={demoDataset.context} sourceKind={demoDataset.sourceKind} />);

    const expectedLabels = ['酒店', '房型', '平台', '入住日期', '竞品组', '需求背景', '采集时间', '数据口径'];
    for (const label of expectedLabels) {
      expect(screen.getByText(label)).toBeVisible();
    }

    expect(screen.getByRole('button', { name: /酒店 西湖商务精选酒店/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /竞品组 核心竞品组 A/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /需求背景 周末、端午演示假期、会展演示日/ })).toBeVisible();
    expect(screen.getByText(/演示数据/)).toBeVisible();

    await user.tab();
    expect(screen.getByRole('button', { name: /酒店 西湖商务精选酒店/ })).toHaveFocus();
  });
});
