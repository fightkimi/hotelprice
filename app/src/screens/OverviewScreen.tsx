import { EventTimeline } from '../components/charts/EventTimeline';
import { TrendChart } from '../components/charts/TrendChart';
import { SignalPanel } from '../components/primitives/SignalPanel';
import type { DemoDataset, Signal } from '../types/contracts';

interface OverviewScreenProps {
  dataset: DemoDataset;
  state: 'normal' | 'loading' | 'empty';
}

export function OverviewScreen({ dataset, state }: OverviewScreenProps) {
  if (state === 'loading') {
    return (
      <section className="screen-grid" data-state="loading">
        <div className="screen-grid screen-grid--three">
          <SignalPanel state="loading" />
          <SignalPanel state="loading" />
          <SignalPanel state="loading" />
        </div>
        <div className="panel">
          <div className="loading-block loading-block--wide" />
          <div className="chart-placeholder" />
        </div>
      </section>
    );
  }

  if (state === 'empty') {
    return (
      <section className="screen-grid">
        <div className="empty-state">
          <div className="stack">
            <span className="demo-badge">演示数据</span>
            <h2 className="panel__title">当前筛选范围暂无可比样本</h2>
            <p className="muted">请扩大房型、平台或入住日期范围后再进行人工复核。</p>
          </div>
        </div>
        <SignalPanel state="no-comparable-sample" />
      </section>
    );
  }

  const [primary, secondary, tertiary] = dataset.signals as [Signal, Signal, Signal];

  return (
    <section className="screen-grid">
      <div className="screen-grid screen-grid--three">
        <SignalPanel signal={primary} />
        <SignalPanel signal={secondary} />
        <SignalPanel signal={tertiary} />
      </div>
      <div className="screen-grid screen-grid--two">
        <TrendChart data={dataset.trend} />
        <EventTimeline events={dataset.trend.events} />
      </div>
    </section>
  );
}
