import type { EventFilters, EventStatus, EventType } from '../types';

interface FilterBarProps {
  filters: EventFilters;
  setFilter: (key: keyof EventFilters, value: string) => void;
  weeks: number[];
  districts: string[];
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Ongoing', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'regional', label: 'Regional' },
  { value: 'district', label: 'District' },
  { value: 'district_cmp', label: 'District Championship' },
  { value: 'champs', label: 'Championship' },
  { value: 'offseason', label: 'Offseason' },
];

const selectClasses = "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer";

export function FilterBar({ filters, setFilter, weeks, districts }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Search events..."
        value={filters.search}
        onChange={e => setFilter('search', e.target.value)}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-w-[200px] flex-1 max-w-sm placeholder:text-[var(--color-text-muted)]"
      />
      <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className={selectClasses}>
        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={filters.type} onChange={e => setFilter('type', e.target.value)} className={selectClasses}>
        {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={filters.week} onChange={e => setFilter('week', e.target.value)} className={selectClasses}>
        <option value="all">All Weeks</option>
        {weeks.map(w => <option key={w} value={String(w)}>Week {w}</option>)}
      </select>
      <select value={filters.district} onChange={e => setFilter('district', e.target.value)} className={selectClasses}>
        <option value="all">All Districts</option>
        {districts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
      </select>
    </div>
  );
}
