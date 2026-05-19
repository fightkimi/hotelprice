import type { DemoDataset } from '../types/contracts';

interface SetupDataScopeScreenProps {
  dataset: DemoDataset;
}

export function SetupDataScopeScreen({ dataset }: SetupDataScopeScreenProps) {
  const scopeItems = [
    ['酒店档案', dataset.context.property],
    ['房型范围', '标准大床房、标准双床房、亲子房、套房'],
    ['平台范围', dataset.context.platform],
    ['竞品范围', dataset.context.competitorGroup],
    ['入住日期', dataset.context.dateRange],
    ['事件上下文', dataset.context.demandContext]
  ] as const;

  return (
    <section className="screen-grid screen-grid--two">
      <div className="panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">设置流程预览</h2>
            <p className="panel__meta">用于展示数据边界和人工复核流程。</p>
          </div>
          <span className="demo-badge">演示数据</span>
        </div>
        <div className="setup-list">
          {scopeItems.map(([label, value]) => (
            <div className="setup-item" key={label}>
              <span className="meta-label">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
      <aside className="panel">
        <div className="panel__header">
          <div>
            <h2 className="panel__title">数据使用边界</h2>
            <p className="panel__meta">本屏帮助客户理解演示口径。</p>
          </div>
        </div>
        <div className="stack">
          <p>{dataset.demoDisclosure}</p>
          <div className="setup-item">
            <span className="meta-label">生产连接</span>
            <strong>当前关闭</strong>
          </div>
          <div className="setup-item">
            <span className="meta-label">价格动作</span>
            <strong>仅建议关注，需人工复核</strong>
          </div>
          <div className="setup-item">
            <span className="meta-label">证据字段</span>
            <strong>来源、采集时间、房型、平台、税费口径、样本</strong>
          </div>
        </div>
      </aside>
    </section>
  );
}
