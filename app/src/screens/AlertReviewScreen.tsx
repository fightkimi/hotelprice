import { useMemo, useState } from 'react';
import { EvidenceDrawer } from '../components/primitives/EvidenceDrawer';
import type { AlertReviewEvidenceRow, AlertReviewPriority, AlertReviewStatus, DemoDataset } from '../types/contracts';

interface AlertReviewScreenProps {
  dataset: DemoDataset;
  drawerOpen: boolean;
}

const priorityLabel: Record<AlertReviewPriority, string> = {
  high: '高优先级',
  medium: '重点关注',
  watch: '观察'
};

const evidenceStatusLabel: Record<AlertReviewEvidenceRow['status'], string> = {
  available: '可用样本',
  'missing-sample': '等待人工补充'
};

function formatMetric(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function formatPrice(value: number | null): string {
  return value === null ? '暂无可比样本' : `CNY ${value}`;
}

export function AlertReviewScreen({ dataset, drawerOpen }: AlertReviewScreenProps) {
  const workflow = dataset.alertReview;
  const [selectedItemId, setSelectedItemId] = useState(workflow.selectedItemId);
  const [statusById, setStatusById] = useState<Record<string, AlertReviewStatus>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const selectedItem = useMemo(
    () => workflow.items.find((item) => item.id === selectedItemId) ?? workflow.items[0],
    [selectedItemId, workflow.items]
  );

  if (!selectedItem) {
    return (
      <section className="screen-grid screen-grid--two observatory-screen alert-review-workflow">
        <div className="panel observatory-panel">
          <div className="panel__header instrument-header">
            <div>
              <h2 className="panel__title">异常提醒中心</h2>
              <p className="panel__meta">当前没有需要复核的演示提醒。</p>
            </div>
            <span className="demo-badge">演示数据</span>
          </div>
        </div>
      </section>
    );
  }

  const selectedEvidence = selectedItem.evidenceRows[0];
  const selectedStatus = statusById[selectedItem.id] ?? selectedItem.defaultStatus;
  const selectedStatusLabel = workflow.statusOptions.find((option) => option.id === selectedStatus)?.label ?? '待复核';
  const selectedNote = notesById[selectedItem.id] ?? selectedItem.defaultNote;

  return (
    <section className="screen-grid screen-grid--two observatory-screen alert-review-workflow">
      <div className="panel observatory-panel">
        <div className="panel__header instrument-header">
          <div>
            <h2 className="panel__title">异常提醒中心</h2>
            <p className="panel__meta">所有价格敏感提醒先进入人工复核。</p>
          </div>
          <span className="demo-badge">演示数据</span>
        </div>
        <div className="table-list" aria-label="异常提醒列表">
          {workflow.items.map((item) => {
            const itemStatus = statusById[item.id] ?? item.defaultStatus;
            const itemStatusLabel = workflow.statusOptions.find((option) => option.id === itemStatus)?.label ?? '待复核';
            return (
              <button
                className="alert-row alert-row--button"
                data-selected={item.id === selectedItem.id}
                key={item.id}
                type="button"
                aria-pressed={item.id === selectedItem.id}
                onClick={() => setSelectedItemId(item.id)}
              >
                <span className="stack stack--tight">
                  <span className="cluster">
                    <strong>{item.title}</strong>
                    <span className="status-chip status-chip--review">{itemStatusLabel}</span>
                    <span className="status-chip status-chip--warning">{priorityLabel[item.reviewPriority]}</span>
                  </span>
                  <span className="muted">{item.summary}</span>
                  <span className="panel__meta">
                    {item.affectedStayDate} · {item.captureTime} · 样本 {item.sampleSize}
                  </span>
                </span>
                <span className="metric alert-row__metric">
                  {formatMetric(item.primaryMetric)}
                  <span className="metric__unit">{item.metricUnit}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stack">
        <article className="panel observatory-panel alert-review-detail" data-testid="alert-review-detail">
          <div className="panel__header instrument-header">
            <div>
              <h2 className="panel__title">{selectedItem.title}</h2>
              <p className="panel__meta">
                影响入住日 {selectedItem.affectedStayDate} · {selectedItem.rateKey.roomType} · {selectedItem.rateKey.platform}
              </p>
            </div>
            <span className="status-chip status-chip--review">需人工复核</span>
          </div>

          <p>{selectedItem.summary}</p>

          <div className="review-status-control" role="group" aria-label="复核状态">
            {workflow.statusOptions.map((option) => (
              <button
                className="filter-chip"
                data-active={option.id === selectedStatus}
                key={option.id}
                type="button"
                onClick={() => setStatusById((current) => ({ ...current, [selectedItem.id]: option.id }))}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="panel__meta">当前状态：{selectedStatusLabel} · 仅当前页面本地记录</p>

          <dl className="evidence-grid">
            <div>
              <dt>房型</dt>
              <dd>{selectedItem.rateKey.roomType}</dd>
            </div>
            <div>
              <dt>入住人数</dt>
              <dd>{selectedItem.rateKey.occupancy} 人</dd>
            </div>
            <div>
              <dt>餐食</dt>
              <dd>{selectedItem.rateKey.mealPlan}</dd>
            </div>
            <div>
              <dt>税费口径</dt>
              <dd>{selectedItem.rateKey.taxFeeBasis}</dd>
            </div>
            <div>
              <dt>取消政策</dt>
              <dd>{selectedItem.rateKey.cancellationPolicy}</dd>
            </div>
          </dl>

          <div className="alert-evidence-list">
            {selectedItem.evidenceRows.map((row, index) => (
              <div className="calendar-evidence-row" key={`${row.role}-${row.captureTime}-${row.label}-${index}`}>
                <strong>{row.label}</strong>
                <span className="panel__meta">
                  {row.source} · {row.captureTime} · 样本 {row.sampleSize} · {evidenceStatusLabel[row.status]} · {formatPrice(row.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="review-note-block">
            <label className="panel__meta" htmlFor="alert-review-note">
              本地复核备注
            </label>
            <textarea
              className="review-note"
              id="alert-review-note"
              value={selectedNote}
              onChange={(event) => setNotesById((current) => ({ ...current, [selectedItem.id]: event.target.value }))}
            />
          </div>

          <div className="review-note-presets" aria-label="备注模板">
            {workflow.notePresets.map((preset) => (
              <button
                className="filter-chip"
                key={preset.id}
                type="button"
                onClick={() => setNotesById((current) => ({ ...current, [selectedItem.id]: preset.text }))}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="calendar-detail-section" aria-label="复核边界">
            {workflow.guardrails.map((guardrail) => (
              <p className="panel__meta" key={guardrail}>
                {guardrail}
              </p>
            ))}
          </div>
        </article>

        <EvidenceDrawer
          open={drawerOpen}
          heading="提醒证据复核"
          rateKey={selectedItem.rateKey}
          source={selectedEvidence.source}
          captureTime={selectedEvidence.captureTime}
          sampleSize={selectedEvidence.sampleSize}
          confidence={selectedEvidence.confidence}
          rationale={selectedItem.summary}
          humanReviewRequired={selectedItem.humanReviewRequired}
        />
      </div>
    </section>
  );
}
