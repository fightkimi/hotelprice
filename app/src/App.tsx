import { AppShell, type ScreenId } from './components/layout/AppShell';
import { demoDataset } from './data/demoDataset';
import { AlertReviewScreen } from './screens/AlertReviewScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { MarketComparisonScreen } from './screens/MarketComparisonScreen';
import { OverviewScreen } from './screens/OverviewScreen';
import { SetupDataScopeScreen } from './screens/SetupDataScopeScreen';
import type { ReactElement } from 'react';

type AppState = 'normal' | 'loading' | 'empty' | 'detail-open' | 'drawer-open';

const screenIds: ScreenId[] = ['overview', 'calendar', 'market', 'alerts', 'setup'];
const appStates: AppState[] = ['normal', 'loading', 'empty', 'detail-open', 'drawer-open'];

function parseScreen(): ScreenId {
  const value = new URLSearchParams(window.location.search).get('screen');
  return screenIds.includes(value as ScreenId) ? (value as ScreenId) : 'overview';
}

function parseState(): AppState {
  const value = new URLSearchParams(window.location.search).get('state');
  return appStates.includes(value as AppState) ? (value as AppState) : 'normal';
}

export function App() {
  const screen = parseScreen();
  const state = parseState();

  const content = {
    overview: <OverviewScreen dataset={demoDataset} state={state === 'loading' || state === 'empty' ? state : 'normal'} />,
    calendar: <CalendarScreen dataset={demoDataset} detailOpen={state === 'detail-open'} />,
    market: <MarketComparisonScreen dataset={demoDataset} />,
    alerts: <AlertReviewScreen dataset={demoDataset} drawerOpen={state === 'drawer-open'} />,
    setup: <SetupDataScopeScreen dataset={demoDataset} />
  } satisfies Record<ScreenId, ReactElement>;

  return (
    <AppShell context={demoDataset.context} sourceKind={demoDataset.sourceKind} currentScreen={screen} state={state}>
      {content[screen]}
    </AppShell>
  );
}
