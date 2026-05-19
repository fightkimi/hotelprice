import type { EventMarker } from '../../types/contracts';

interface EventTimelineProps {
  events: EventMarker[];
}

const typeLabel: Record<EventMarker['type'], string> = {
  holiday: '节假日',
  concert: '演出',
  expo: '会展'
};

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <section className="chart-panel event-timeline">
      <div className="chart-panel__header">
        <div>
          <h2 className="panel__title">事件时间线</h2>
          <p className="panel__meta">事件影响仅作为人工复核线索</p>
        </div>
      </div>
      <ol className="event-timeline__list">
        {events.map((event) => (
          <li className="event-timeline__item" key={`${event.date}-${event.label}`}>
            <div className="event-timeline__dot" />
            <div className="stack stack--tight">
              <div className="cluster">
                <strong>{event.label}</strong>
                <span className="status-chip">{typeLabel[event.type]}</span>
              </div>
              <p className="muted">
                {event.date} · 影响 +{event.lift}% · {event.confidence === 'sample' ? '样本充分' : '部分覆盖'}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
