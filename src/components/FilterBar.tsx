import { useState } from 'react';
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
  { value: 'district_cmp', label: 'District Champ' },
  { value: 'champs', label: 'Championship' },
  { value: 'offseason', label: 'Offseason' },
];

const selectClasses = "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto";

export function FilterBar({ filters, setFilter, weeks, districts }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount = [filters.status, filters.type, filters.week, filters.district].filter(v => v !== 'all').length;

  return (
    <div className="mb-6 space-y-3">
      {/* Search + toggle row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 flex-1 placeholder:text-[var(--color-text-muted)]"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2.5 text-sm cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          {activeFilterCount > 0 && <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filter dropdowns - always visible on desktop, toggleable on mobile */}
      <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
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
    </div>
  );
}
