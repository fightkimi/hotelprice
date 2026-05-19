import { BarChart3, Bell, CalendarDays, ClipboardList, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ContextRibbon } from './ContextRibbon';
import type { ContextSelection, SourceKind } from '../../types/contracts';

export type ScreenId = 'overview' | 'calendar' | 'market' | 'alerts' | 'setup';

interface AppShellProps {
  context: ContextSelection;
  sourceKind: SourceKind;
  currentScreen: ScreenId;
  state: string;
  children: ReactNode;
}

const navItems = [
  { id: 'overview', label: '概览', icon: BarChart3 },
  { id: 'calendar', label: '日历', icon: CalendarDays },
  { id: 'market', label: '平台价差', icon: ClipboardList },
  { id: 'alerts', label: '提醒复核', icon: Bell },
  { id: 'setup', label: '数据范围', icon: Settings2 }
] as const;

export function AppShell({ context, sourceKind, currentScreen, state, children }: AppShellProps) {
  return (
    <div className="app-shell" data-state={state}>
      <div className="app-shell__inner">
        <header className="app-header">
          <div>
            <h1 className="app-title">酒店价格情报工作台</h1>
            <p className="app-subtitle">以房型、平台、事件和样本质量为边界的演示数据分析视图。</p>
          </div>
          <nav className="app-nav" aria-label="产品视图">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                className="nav-button"
                type="button"
                key={id}
                aria-current={currentScreen === id ? 'page' : undefined}
                aria-label={label}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={2} />
                {label}
              </button>
            ))}
          </nav>
        </header>
        <ContextRibbon context={context} sourceKind={sourceKind} />
        <main>{children}</main>
      </div>
    </div>
  );
}
