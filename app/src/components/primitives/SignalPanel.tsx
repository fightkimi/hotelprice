import { AlertTriangle, CheckCircle2, Info, TrendingDown } from 'lucide-react';
import type { Signal } from '../../types/contracts';

interface SignalPanelProps {
  signal?: Signal;
  state?: 'normal' | 'loading' | 'no-comparable-sample';
}

const severityMeta = {
  normal: { label: '稳定', className: 'status-chip--success', icon: CheckCircle2 },
  warning: { label: '建议关注', className: 'status-chip--warning', icon: AlertTriangle },
  risk: { label: '高优先级', className: 'status-chip--review', icon: AlertTriangle },
  softness: { label: '样本质量', className: '', icon: TrendingDown }
} as const;

export function SignalPanel({ signal, state = 'normal' }: SignalPanelProps) {
  if (state === 'loading') {
    return (
      <article className="panel signal-panel" data-state="loading" aria-busy="true">
        <div className="loading-block" />
        <div className="loading-block loading-block--wide" />
        <div className="loading-block loading-block--short" />
      </article>
    );
  }

  if (state === 'no-comparable-sample' || !signal) {
    return (
      <article className="panel signal-panel" data-state="no-comparable-sample">
        <div className="cluster">
          <span className="status-chip">暂无可比样本</span>
        </div>
        <p className="muted">当前筛选范围暂不形成价差判断，请扩大日期或平台范围后复核。</p>
      </article>
    );
  }

  const meta = severityMeta[signal.severity];
  const Icon = meta.icon;
  const marker = signal.evidenceMarkers[0];

  return (
    <article className="panel signal-panel" data-state={signal.severity}>
      <div className="signal-panel__top">
        <span className={`status-chip ${meta.className}`}>
          <Icon aria-hidden="true" size={14} />
          {meta.label}
        </span>
        {signal.humanReviewRequired ? <span className="status-chip status-chip--review">需人工复核</span> : null}
      </div>
      <h3 className="signal-panel__title">{signal.title}</h3>
      <div className="metric">
        {signal.primaryMetric > 0 ? '+' : ''}
        {signal.primaryMetric}
        <span className="metric__unit">{signal.metricUnit}</span>
      </div>
      <p className="muted">{signal.summary}</p>
      <div className="signal-panel__evidence">
        <Info aria-hidden="true" size={14} />
        <span>
          {marker.label} · {marker.source} · 样本 {marker.sampleSize}
        </span>
      </div>
    </article>
  );
}
