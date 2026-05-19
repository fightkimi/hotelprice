import type { ContextSelection, SourceKind } from '../../types/contracts';

interface ContextRibbonProps {
  context: ContextSelection;
  sourceKind: SourceKind;
}

const sourceLabels: Record<SourceKind, string> = {
  'fixture-demo': '演示数据'
};

export function ContextRibbon({ context, sourceKind }: ContextRibbonProps) {
  const items = [
    ['酒店', context.property],
    ['房型', context.roomType],
    ['平台', context.platform],
    ['入住日期', context.dateRange],
    ['竞品组', context.competitorGroup],
    ['需求背景', context.demandContext],
    ['采集时间', context.captureTime]
  ] as const;

  return (
    <section className="context-ribbon" aria-label="当前分析范围" data-state="data-caveat-visible">
      {items.map(([label, value]) => (
        <button className="context-ribbon__item context-ribbon__control" key={label} type="button" aria-label={`${label} ${value}`}>
          <span className="context-ribbon__label">{label}</span>
          <span className="context-ribbon__value">{value}</span>
        </button>
      ))}
      <button
        className="context-ribbon__item context-ribbon__control"
        type="button"
        aria-label={`数据口径 ${sourceLabels[sourceKind]}`}
      >
        <span className="context-ribbon__label">数据口径</span>
        <span className="context-ribbon__value">
          <span className="demo-badge">{sourceLabels[sourceKind]}</span>
        </span>
      </button>
    </section>
  );
}
