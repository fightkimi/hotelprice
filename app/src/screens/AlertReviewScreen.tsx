import { EvidenceDrawer } from '../components/primitives/EvidenceDrawer';
import type { DemoDataset } from '../types/contracts';

interface AlertReviewScreenProps {
  dataset: DemoDataset;
  drawerOpen: boolean;
}

export function AlertReviewScreen({ dataset, drawerOpen }: AlertReviewScreenProps) {
  const selectedSignal = dataset.signals[0];
  const selectedPoint = dataset.trend.series[0].points[0];
  const evidence = selectedSignal.evidenceMarkers[0];

  return (
    <section className="screen-grid screen-grid--two observatory-screen">
      <div className="panel observatory-panel">
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">异常提醒中心</h2>
            <p className="panel__meta">所有价格敏感提醒先进入人工复核。</p>
          </div>
          <span className="demo-badge">演示数据</span>
        </div>
        <div className="table-list">
          {dataset.signals.map((signal) => (
            <article className="alert-row" key={signal.id}>
              <div className="stack stack--tight">
                <div className="cluster">
                  <strong>{signal.title}</strong>
                  <span className="status-chip status-chip--review">需人工复核</span>
                </div>
                <p className="muted">{signal.summary}</p>
                <span className="panel__meta">
                  {signal.evidenceMarkers[0].source} · 采集时间 {signal.evidenceMarkers[0].captureTime} · 样本{' '}
                  {signal.evidenceMarkers[0].sampleSize}
                </span>
              </div>
              <span className="metric alert-row__metric">
                {signal.primaryMetric > 0 ? '+' : ''}
                {signal.primaryMetric}
                <span className="metric__unit">{signal.metricUnit}</span>
              </span>
            </article>
          ))}
        </div>
      </div>
      <EvidenceDrawer
        open={drawerOpen}
        heading="提醒证据复核"
        rateKey={selectedPoint.rateKey}
        source={evidence.source}
        captureTime={evidence.captureTime}
        sampleSize={evidence.sampleSize}
        confidence={evidence.confidence}
        rationale={selectedSignal.summary}
        humanReviewRequired={selectedSignal.humanReviewRequired}
      />
    </section>
  );
}
