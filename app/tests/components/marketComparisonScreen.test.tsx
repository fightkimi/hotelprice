import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { MarketComparisonScreen } from '../../src/screens/MarketComparisonScreen';

describe('MarketComparisonScreen drilldown workflow', () => {
  it('renders selected market drilldown detail with competitor samples and boundaries', () => {
    render(<MarketComparisonScreen dataset={demoDataset} detailOpen />);

    const detail = screen.getByTestId('market-drilldown-detail');
    expect(detail).toHaveTextContent('需人工复核');
    expect(detail).toHaveTextContent('2026-05-31');
    expect(detail).toHaveTextContent('标准大床房');
    expect(detail).toHaveTextContent('核心竞品价格区间');
    expect(detail).toHaveTextContent('竞品样本');
    expect(detail).toHaveTextContent('采集时间');
    expect(detail).toHaveTextContent('含税含服务费');
    expect(detail).toHaveTextContent('入住前24小时可取消');
    expect(within(detail).getAllByText(/可比样本|缺少可比样本|来源样本暂不可用|暂不可售|样本过期/).length).toBeGreaterThan(0);
  });

  it('updates detail when a missing-sample option is selected without pseudo prices', async () => {
    const user = userEvent.setup();
    render(<MarketComparisonScreen dataset={demoDataset} detailOpen />);

    await user.click(screen.getByRole('button', { name: /05\/27/ }));

    const detail = screen.getByTestId('market-drilldown-detail');
    expect(detail).toHaveTextContent('2026-05-27');
    expect(detail).toHaveTextContent('暂无可比样本，需要等待人工导入或获授权来源补充。');
    expect(detail).toHaveTextContent('缺少可比样本');
    expect(detail).toHaveTextContent('来源样本暂不可用');
    expect(detail).toHaveTextContent('暂不可售');
    expect(detail).not.toHaveTextContent('CNY null');
    expect(detail).not.toHaveTextContent('CNY 0');
  });
});
