import { X } from 'lucide-react';
import type { EvidenceMarker, RateKey } from '../../types/contracts';

interface EvidenceDrawerProps {
  open: boolean;
  heading: string;
  rateKey: RateKey;
  source: EvidenceMarker['source'];
  captureTime: EvidenceMarker['captureTime'];
  sampleSize: EvidenceMarker['sampleSize'];
  confidence: EvidenceMarker['confidence'];
  rationale: string;
  humanReviewRequired: boolean;
  state?: 'normal' | 'loading' | 'unavailable-source' | 'no-comparable-sample';
}

const confidenceLabel: Record<EvidenceMarker['confidence'], string> = {
  sample: '覆盖充分',
  partial: '部分覆盖',
  unavailable: '不可用'
};

export function EvidenceDrawer({
  open,
  heading,
  rateKey,
  source,
  captureTime,
  sampleSize,
  confidence,
  rationale,
  humanReviewRequired,
  state = 'normal'
}: EvidenceDrawerProps) {
  if (!open) {
    return null;
  }

  const body =
    state === 'loading' ? (
      <div className="stack">
        <div className="loading-block" />
        <div className="loading-block loading-block--wide" />
        <div className="loading-block loading-block--short" />
      </div>
    ) : state === 'unavailable-source' || state === 'no-comparable-sample' ? (
      <div className="empty-state">
        <div className="stack stack--tight">
          <h3 className="panel__title">暂无可比样本</h3>
          <p className="muted">当前范围没有足够样本支持价差判断，请调整筛选条件后人工复核。</p>
        </div>
      </div>
    ) : (
      <div className="stack">
        <p>{rationale}</p>
        <dl className="evidence-grid">
          <div>
            <dt>来源</dt>
            <dd>{source}</dd>
          </div>
          <div>
            <dt>采集时间</dt>
            <dd>{captureTime}</dd>
          </div>
          <div>
            <dt>样本</dt>
            <dd>{sampleSize} 条</dd>
          </div>
          <div>
            <dt>置信度</dt>
            <dd>{confidenceLabel[confidence]}</dd>
          </div>
          <div>
            <dt>房型</dt>
            <dd>{rateKey.roomType}</dd>
          </div>
          <div>
            <dt>平台</dt>
            <dd>{rateKey.platform}</dd>
          </div>
          <div>
            <dt>入住日期</dt>
            <dd>{rateKey.stayDate}</dd>
          </div>
          <div>
            <dt>税费口径</dt>
            <dd>{rateKey.taxFeeBasis}</dd>
          </div>
          <div>
            <dt>入住人数</dt>
            <dd>{rateKey.occupancy} 人</dd>
          </div>
          <div>
            <dt>餐食</dt>
            <dd>{rateKey.mealPlan}</dd>
          </div>
          <div>
            <dt>取消政策</dt>
            <dd>{rateKey.cancellationPolicy}</dd>
          </div>
        </dl>
      </div>
    );

  return (
    <aside className="evidence-drawer" role="dialog" aria-modal="false" aria-labelledby="evidence-heading" data-state={state}>
      <div className="evidence-drawer__header">
        <div className="stack stack--tight">
          <h2 className="panel__title" id="evidence-heading">
            {heading}
          </h2>
          {humanReviewRequired ? <span className="status-chip status-chip--review">需人工复核</span> : null}
        </div>
        <button className="icon-button" type="button" aria-label="关闭证据面板">
          <X aria-hidden="true" size={16} />
        </button>
      </div>
      {body}
    </aside>
  );
}
