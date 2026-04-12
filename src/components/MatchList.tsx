import type { StatboticsMatch } from '../types';

export function MatchList({ matches, highlightTeam }: { matches: StatboticsMatch[]; highlightTeam?: number }) {
  const quals = matches.filter(m => !m.elim).sort((a, b) => a.match_number - b.match_number);
  const elims = matches.filter(m => m.elim).sort((a, b) => a.time - b.time);

  return (
    <div className="space-y-6">
      {quals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase mb-3">Qualification Matches ({quals.length})</h3>
          <MatchTable matches={quals} highlightTeam={highlightTeam} />
        </div>
      )}
      {elims.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase mb-3">Elimination Matches ({elims.length})</h3>
          <MatchTable matches={elims} highlightTeam={highlightTeam} />
        </div>
      )}
    </div>
  );
}

function MatchTable({ matches, highlightTeam }: { matches: StatboticsMatch[]; highlightTeam?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-surface)]">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase">Match</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-red-400 uppercase">Red Alliance</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-[var(--color-text-muted)] uppercase">Score</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-blue-400 uppercase">Blue Alliance</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-[var(--color-text-muted)] uppercase">Pred</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {matches.map(m => {
            const redWon = m.result?.winner === 'red';
            const blueWon = m.result?.winner === 'blue';
            const played = m.status === 'Completed';
            return (
              <tr key={m.key} className="hover:bg-[var(--color-surface-hover)]">
                <td className="px-3 py-2 text-[var(--color-text-muted)] text-xs whitespace-nowrap">{m.match_name}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1.5">
                    {m.alliances.red.team_keys.map(t => (
                      <span key={t} className={`text-xs px-1.5 py-0.5 rounded ${highlightTeam === t ? 'bg-red-700 text-white font-bold' : 'text-red-300'}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-center font-mono text-xs whitespace-nowrap">
                  {played ? (
                    <>
                      <span className={redWon ? 'text-red-400 font-bold' : 'text-red-300/60'}>{m.result.red_score}</span>
                      <span className="text-[var(--color-text-muted)] mx-1">-</span>
                      <span className={blueWon ? 'text-blue-400 font-bold' : 'text-blue-300/60'}>{m.result.blue_score}</span>
                    </>
                  ) : (
                    <span className="text-[var(--color-text-muted)]">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1.5">
                    {m.alliances.blue.team_keys.map(t => (
                      <span key={t} className={`text-xs px-1.5 py-0.5 rounded ${highlightTeam === t ? 'bg-blue-700 text-white font-bold' : 'text-blue-300'}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-xs text-[var(--color-text-muted)]">
                  {m.pred ? `${(m.pred.red_win_prob * 100).toFixed(0)}%R` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
