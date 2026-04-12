import { Link } from 'react-router-dom';
import type { StatboticsEvent } from '../types';
import { formatDate, getEventTypeLabel, getStatusBadgeClasses } from '../utils/helpers';

export function EventCard({ event }: { event: StatboticsEvent }) {
  return (
    <Link
      to={`/event/${event.key}`}
      className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 hover:bg-[var(--color-surface-hover)] hover:border-blue-500/50 transition-all no-underline"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold text-sm leading-tight flex-1 mr-2">{event.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusBadgeClasses(event.status)}`}>
          {event.status === 'Ongoing' && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse" />}
          {event.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
        <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
        <span>{event.state ? `${event.state}, ${event.country}` : event.country}</span>
        <span>{getEventTypeLabel(event.type)}</span>
        <span>Week {event.week}</span>
      </div>
      <div className="mt-3 flex gap-4 text-xs">
        <div>
          <span className="text-[var(--color-text-muted)]">Teams: </span>
          <span className="text-white font-medium">{event.num_teams}</span>
        </div>
        <div>
          <span className="text-[var(--color-text-muted)]">Avg EPA: </span>
          <span className="text-blue-400 font-medium">{event.epa?.mean?.toFixed(1) ?? '—'}</span>
        </div>
        <div>
          <span className="text-[var(--color-text-muted)]">Max EPA: </span>
          <span className="text-yellow-400 font-medium">{event.epa?.max?.toFixed(1) ?? '—'}</span>
        </div>
      </div>
    </Link>
  );
}
