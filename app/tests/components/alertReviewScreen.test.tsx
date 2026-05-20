import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../src/data/demoDataset';
import { AlertReviewScreen } from '../../src/screens/AlertReviewScreen';

describe('AlertReviewScreen workflow', () => {
  function alertButton(item: (typeof demoDataset.alertReview.items)[number]) {
    return screen.getByRole('button', { name: new RegExp(`${item.title}.*${item.affectedStayDate}`) });
  }

  it('selects alerts and updates the review detail panel', async () => {
    const user = userEvent.setup();
    render(<AlertReviewScreen dataset={demoDataset} drawerOpen />);

    const items = demoDataset.alertReview.items;
    expect(items.length).toBeGreaterThan(1);

    const first = items[0];
    const second = items[1];
    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(first.title);
    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(first.affectedStayDate);

    await user.click(alertButton(second));

    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(second.title);
    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent(second.affectedStayDate);
    expect(alertButton(second)).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps review status and notes local to the selected alert', async () => {
    const user = userEvent.setup();
    render(<AlertReviewScreen dataset={demoDataset} drawerOpen />);

    const first = demoDataset.alertReview.items[0];
    const second = demoDataset.alertReview.items[1];

    await user.click(screen.getByRole('button', { name: '复核中' }));
    await user.clear(screen.getByLabelText('本地复核备注'));
    await user.type(screen.getByLabelText('本地复核备注'), '核对亲子房库存后再判断');

    expect(screen.getByTestId('alert-review-detail')).toHaveTextContent('复核中');
    expect(screen.getByLabelText('本地复核备注')).toHaveValue('核对亲子房库存后再判断');

    await user.click(alertButton(second));
    expect(screen.getByLabelText('本地复核备注')).toHaveValue(second.defaultNote);

    await user.click(alertButton(first));
    expect(screen.getByLabelText('本地复核备注')).toHaveValue('核对亲子房库存后再判断');
  });
});
