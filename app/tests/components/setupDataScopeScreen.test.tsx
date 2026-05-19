import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { SetupDataScopeScreen } from '../../src/screens/SetupDataScopeScreen';

describe('SetupDataScopeScreen', () => {
  it('renders data scope and capture entry preview without unsafe visible copy', () => {
    render(<SetupDataScopeScreen dataset={demoDataset} />);

    expect(screen.getByRole('heading', { name: '数据范围' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '采集入口' })).toBeVisible();
    expect(screen.getByText('当前演示样本')).toBeVisible();
    expect(screen.getByText('手工导入预览')).toBeVisible();
    expect(screen.getByText('批准接口预览')).toBeVisible();
    expect(screen.getByText(/核心竞品/)).toBeVisible();
    expect(screen.getByText(/入住日期/)).toBeVisible();
    expect(screen.getByText(/含税/)).toBeVisible();
    expect(screen.getAllByText(/人工复核/).length).toBeGreaterThan(0);
    expect(screen.getByText('当前关闭')).toBeVisible();

    const visibleText = document.body.textContent ?? '';
    expect(visibleText).not.toMatch(/自动调价|自动改价|cookie|token|crawler|scraper|captcha|recommendedPrice/i);
  });

  it('exposes the Revenue Observatory visual structure for data scope review', () => {
    const { container } = render(<SetupDataScopeScreen dataset={demoDataset} />);

    expect(container.querySelector('[data-visual-system="revenue-observatory"]')).not.toBeNull();
    expect(container.querySelector('.scope-observatory-map')).not.toBeNull();
    expect(container.querySelector('.capture-signal-rail')).not.toBeNull();
    expect(container.querySelectorAll('.observatory-glass-panel').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll('.scope-orbit-node').length).toBeGreaterThanOrEqual(4);
  });
});
