import { useState, useEffect } from 'react';
import type { EventFilters, EventStatus, EventType } from '../types';

interface SavedPreset {
  id: string;
  name: string;
  filters: EventFilters;
}

interface FilterBarProps {
  filters: EventFilters;
  setFilter: (key: keyof EventFilters, value: string) => void;
  applyFilters: (filters: EventFilters) => void;
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

const STORAGE_KEY = 'frc-saved-filters';

function loadPresets(): SavedPreset[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePresets(presets: SavedPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

const selectClasses = "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary-light)] cursor-pointer w-full sm:w-auto";

export function FilterBar({ filters, setFilter, applyFilters, weeks, districts }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [presets, setPresets] = useState<SavedPreset[]>(loadPresets);
  const [savingName, setSavingName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const activeFilterCount = [filters.status, filters.type, filters.week, filters.district].filter(v => v !== 'all').length;

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  const hasActiveFilters = activeFilterCount > 0 || filters.search !== '';

  const handleSave = () => {
    if (!savingName.trim()) return;
    const preset: SavedPreset = {
      id: Date.now().toString(),
      name: savingName.trim(),
      filters: { ...filters },
    };
    setPresets(prev => [...prev, preset]);
    setSavingName('');
    setShowSaveInput(false);
  };

  const handleDelete = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  const handleApply = (preset: SavedPreset) => {
    applyFilters(preset.filters);
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Saved filter presets */}
      {(presets.length > 0 || hasActiveFilters) && (
        <div className="flex flex-wrap items-center gap-2">
          {presets.map(preset => (
            <span
              key={preset.id}
              className="inline-flex items-center gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-text)] transition-colors group"
            >
              <button onClick={() => handleApply(preset)} className="cursor-pointer bg-transparent border-none text-inherit p-0">
                {preset.name}
              </button>
              <button
                onClick={() => handleDelete(preset.id)}
                className="cursor-pointer bg-transparent border-none text-[var(--color-text-muted)] hover:text-red-400 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                title="Delete preset"
              >
                &times;
              </button>
            </span>
          ))}

          {hasActiveFilters && !showSaveInput && (
            <button
              onClick={() => setShowSaveInput(true)}
              className="inline-flex items-center gap-1 bg-transparent border border-dashed border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              + Save Filter
            </button>
          )}

          {showSaveInput && (
            <span className="inline-flex items-center gap-1">
              <input
                type="text"
                placeholder="Preset name..."
                value={savingName}
                onChange={e => setSavingName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-full px-3 py-1 text-xs focus:outline-none focus:border-[var(--color-primary-light)] w-32"
                autoFocus
              />
              <button onClick={handleSave} className="text-xs text-[var(--color-primary-light)] hover:text-[var(--color-text)] cursor-pointer bg-transparent border-none p-0">Save</button>
              <button onClick={() => { setShowSaveInput(false); setSavingName(''); }} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer bg-transparent border-none p-0">Cancel</button>
            </span>
          )}
        </div>
      )}

      {/* Search + toggle row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary-light)] flex-1 placeholder:text-[var(--color-text-muted)]"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2.5 text-sm cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          {activeFilterCount > 0 && <span className="bg-[var(--color-primary)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filter dropdowns */}
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
