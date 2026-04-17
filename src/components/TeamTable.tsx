import { useState } from 'react';
import type { StatboticsTeamEvent } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface TeamTableProps {
  teamEvents: StatboticsTeamEvent[];
  selectedTeams: number[];
  onToggleTeam: (team: number) => void;
}

type SortKey = 'rank' | 'team' | 'epa' | 'winrate' | 'auto' | 'teleop' | 'endgame';

export function TeamTable({ teamEvents, selectedTeams, onToggleTeam }: TeamTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('epa');
  const [sortAsc, setSortAsc] = useState(false);
  const debouncedSearch = useDebounce(search, 150);

  const filtered = teamEvents
    .filter(te => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        String(te.team).includes(q) ||
        te.team_name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'rank': av = a.record.qual.rank || 999; bv = b.record.qual.rank || 999; break;
        case 'team': av = a.team; bv = b.team; break;
        case 'epa': av = a.epa.total_points.mean; bv = b.epa.total_points.mean; break;
        case 'winrate': av = a.record.total.winrate; bv = b.record.total.winrate; break;
        case 'auto': av = a.epa.breakdown?.auto_points ?? 0; bv = b.epa.breakdown?.auto_points ?? 0; break;
        case 'teleop': av = a.epa.breakdown?.teleop_points ?? 0; bv = b.epa.breakdown?.teleop_points ?? 0; break;
        case 'endgame': av = a.epa.breakdown?.endgame_points ?? 0; bv = b.epa.breakdown?.endgame_points ?? 0; break;
        default: av = 0; bv = 0;
      }
      return sortAsc ? av - bv : bv - av;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'rank' || key === 'team'); }
  };

  const SortHeader = ({ k, children, className = '' }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th
      className={`px-2 sm:px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--color-text)] select-none whitespace-nowrap ${className}`}
      onClick={() => handleSort(k)}
    >
      {children} {sortKey === k && (sortAsc ? '▲' : '▼')}
    </th>
  );

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search teams by number or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder:text-[var(--color-text-muted)]"
        />
        <div className="flex gap-3 text-xs text-[var(--color-text-muted)]">
          <span>{filtered.length} teams</span>
          {selectedTeams.length > 0 && (
            <span className="text-blue-400">{selectedTeams.length} selected for comparison</span>
          )}
        </div>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-2">
        {/* Mobile sort control */}
        <div className="flex gap-2 mb-3">
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-2 py-1.5 text-xs flex-1"
          >
            <option value="epa">Sort: EPA</option>
            <option value="rank">Sort: Rank</option>
            <option value="team">Sort: Team #</option>
            <option value="winrate">Sort: Win%</option>
            <option value="auto">Sort: Auto</option>
            <option value="teleop">Sort: Teleop</option>
            <option value="endgame">Sort: Endgame</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-1.5 text-xs cursor-pointer"
          >
            {sortAsc ? '▲ Asc' : '▼ Desc'}
          </button>
        </div>

        {filtered.map(te => {
          const isSelected = selectedTeams.includes(te.team);
          return (
            <div
              key={te.team}
              className={`bg-[var(--color-bg)] border rounded-lg p-3 cursor-pointer active:scale-[0.98] transition-transform ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-[var(--color-border)]'}`}
              onClick={() => onToggleTeam(te.team)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <input type="checkbox" checked={isSelected} readOnly className="accent-blue-500 shrink-0" />
                  <span className="text-blue-400 font-bold text-base">{te.team}</span>
                  <span className="text-[var(--color-text)] text-sm truncate">{te.team_name}</span>
                </div>
                <span className="text-[var(--color-text-muted)] text-xs shrink-0 ml-2">#{te.record.qual.rank || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
                <div>
                  <span className="text-[var(--color-text-muted)]">EPA </span>
                  <span className="text-orange-500 font-mono font-bold">{te.epa.total_points.mean.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Win </span>
                  <span className="font-mono">{(te.record.total.winrate * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Rec </span>
                  <span className="text-[var(--color-text-muted)]">{te.record.total.wins}-{te.record.total.losses}-{te.record.total.ties}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Auto </span>
                  <span className="text-green-400 font-mono">{te.epa.breakdown?.auto_points?.toFixed(1) ?? '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Tele </span>
                  <span className="text-purple-400 font-mono">{te.epa.breakdown?.teleop_points?.toFixed(1) ?? '—'}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">End </span>
                  <span className="text-orange-400 font-mono">{te.epa.breakdown?.endgame_points?.toFixed(1) ?? '—'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)]">
            <tr>
              <th className="px-2 sm:px-3 py-2 w-8"></th>
              <SortHeader k="rank">Rank</SortHeader>
              <SortHeader k="team">Team</SortHeader>
              <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">Name</th>
              <SortHeader k="epa">EPA</SortHeader>
              <SortHeader k="winrate">Win%</SortHeader>
              <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase hidden lg:table-cell">Record</th>
              <SortHeader k="auto" className="hidden md:table-cell">Auto</SortHeader>
              <SortHeader k="teleop" className="hidden md:table-cell">Teleop</SortHeader>
              <SortHeader k="endgame" className="hidden md:table-cell">Endgame</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.map(te => {
              const isSelected = selectedTeams.includes(te.team);
              return (
                <tr
                  key={te.team}
                  className={`hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors ${isSelected ? 'bg-blue-900/20' : ''}`}
                  onClick={() => onToggleTeam(te.team)}
                >
                  <td className="px-2 sm:px-3 py-2">
                    <input type="checkbox" checked={isSelected} readOnly className="rounded border-gray-600 accent-blue-500" />
                  </td>
                  <td className="px-2 sm:px-3 py-2 text-[var(--color-text-muted)]">{te.record.qual.rank || '—'}</td>
                  <td className="px-2 sm:px-3 py-2 font-bold text-blue-400">{te.team}</td>
                  <td className="px-2 sm:px-3 py-2 text-[var(--color-text)] max-w-[200px] truncate">{te.team_name}</td>
                  <td className="px-2 sm:px-3 py-2 font-mono text-orange-500">{te.epa.total_points.mean.toFixed(1)}</td>
                  <td className="px-2 sm:px-3 py-2 font-mono">{(te.record.total.winrate * 100).toFixed(0)}%</td>
                  <td className="px-2 sm:px-3 py-2 text-[var(--color-text-muted)] hidden lg:table-cell">
                    {te.record.total.wins}-{te.record.total.losses}-{te.record.total.ties}
                  </td>
                  <td className="px-2 sm:px-3 py-2 font-mono text-green-400 hidden md:table-cell">{te.epa.breakdown?.auto_points?.toFixed(1) ?? '—'}</td>
                  <td className="px-2 sm:px-3 py-2 font-mono text-purple-400 hidden md:table-cell">{te.epa.breakdown?.teleop_points?.toFixed(1) ?? '—'}</td>
                  <td className="px-2 sm:px-3 py-2 font-mono text-orange-400 hidden md:table-cell">{te.epa.breakdown?.endgame_points?.toFixed(1) ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
