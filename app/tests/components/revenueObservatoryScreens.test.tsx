import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../src/components/layout/AppShell';
import { demoDataset } from '../../src/data/demoDataset';
import { AlertReviewScreen } from '../../src/screens/AlertReviewScreen';
import { CalendarScreen } from '../../src/screens/CalendarScreen';
import { MarketComparisonScreen } from '../../src/screens/MarketComparisonScreen';
import { OverviewScreen } from '../../src/screens/OverviewScreen';
import { SetupDataScopeScreen } from '../../src/screens/SetupDataScopeScreen';

describe('Revenue Observatory global visual system', () => {
  it('marks the app shell as the global observatory visual system', () => {
    const { container } = render(
      <AppShell context={demoDataset.context} sourceKind={demoDataset.sourceKind} currentScreen="overview" state="normal">
        <OverviewScreen dataset={demoDataset} state="normal" />
      </AppShell>
    );

    expect(container.querySelector('.app-shell[data-visual-system="revenue-observatory"]')).not.toBeNull();
    expect(container.querySelector('.app-header__signal-rail')).not.toBeNull();
    expect(container.querySelector('.metric-lattice')).not.toBeNull();
    expect(container.querySelector('.chart-frame')).not.toBeNull();
  });

  it('applies observatory primitives across all five screens', () => {
    const screens = [
      <OverviewScreen key="overview" dataset={demoDataset} state="normal" />,
      <CalendarScreen key="calendar" dataset={demoDataset} detailOpen />,
      <MarketComparisonScreen key="market" dataset={demoDataset} />,
      <AlertReviewScreen key="alerts" dataset={demoDataset} drawerOpen />,
      <SetupDataScopeScreen key="setup" dataset={demoDataset} />
    ];

    for (const screen of screens) {
      const { container, unmount } = render(screen);

      expect(container.querySelector('.observatory-screen')).not.toBeNull();
      expect(container.querySelectorAll('.observatory-panel, .observatory-glass-panel').length).toBeGreaterThanOrEqual(1);
      expect(container.querySelector('.instrument-header')).not.toBeNull();

      unmount();
    }
  });
});
