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
        case 'auto': av = a.epa.breakdown?.auto_points?.mean ?? 0; bv = b.epa.breakdown?.auto_points?.mean ?? 0; break;
        case 'teleop': av = a.epa.breakdown?.teleop_points?.mean ?? 0; bv = b.epa.breakdown?.teleop_points?.mean ?? 0; break;
        case 'endgame': av = a.epa.breakdown?.endgame_points?.mean ?? 0; bv = b.epa.breakdown?.endgame_points?.mean ?? 0; break;
        default: av = 0; bv = 0;
      }
      return sortAsc ? av - bv : bv - av;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'rank' || key === 'team'); }
  };

  const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider cursor-pointer hover:text-white select-none"
      onClick={() => handleSort(k)}
    >
      {children} {sortKey === k && (sortAsc ? '▲' : '▼')}
    </th>
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search teams by number or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-[var(--color-text-muted)]"
        />
        <span className="text-xs text-[var(--color-text-muted)] ml-2">{filtered.length} teams</span>
        {selectedTeams.length > 0 && (
          <span className="text-xs text-blue-400 ml-3">{selectedTeams.length} selected for comparison</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)]">
            <tr>
              <th className="px-3 py-2 w-8"></th>
              <SortHeader k="rank">Rank</SortHeader>
              <SortHeader k="team">Team</SortHeader>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">Name</th>
              <SortHeader k="epa">EPA</SortHeader>
              <SortHeader k="winrate">Win%</SortHeader>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">Record</th>
              <SortHeader k="auto">Auto</SortHeader>
              <SortHeader k="teleop">Teleop</SortHeader>
              <SortHeader k="endgame">Endgame</SortHeader>
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
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-gray-600 accent-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2 text-[var(--color-text-muted)]">{te.record.qual.rank || '—'}</td>
                  <td className="px-3 py-2 font-bold text-blue-400">{te.team}</td>
                  <td className="px-3 py-2 text-white max-w-[200px] truncate">{te.team_name}</td>
                  <td className="px-3 py-2 font-mono text-yellow-400">{te.epa.total_points.mean.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{(te.record.total.winrate * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2 text-[var(--color-text-muted)]">
                    {te.record.total.wins}-{te.record.total.losses}-{te.record.total.ties}
                  </td>
                  <td className="px-3 py-2 font-mono text-green-400">{te.epa.breakdown?.auto_points?.mean?.toFixed(1) ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-purple-400">{te.epa.breakdown?.teleop_points?.mean?.toFixed(1) ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-orange-400">{te.epa.breakdown?.endgame_points?.mean?.toFixed(1) ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
