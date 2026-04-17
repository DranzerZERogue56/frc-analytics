import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  ScatterChart, Scatter, CartesianGrid,
  LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ReferenceLine, ComposedChart,
} from 'recharts';
import type { StatboticsTeamEvent, StatboticsMatch } from '../types';
import { useTheme } from '../contexts/ThemeContext';

/* ─── Color System ─── */

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
const PINK_COLORS = ['#ff0a54', '#ff477e', '#ff5c8a', '#ff7096', '#ff85a1', '#ff99ac'];

function useChartColors() {
  const { isPinkMode } = useTheme();
  const p = isPinkMode;
  return {
    colors: p ? PINK_COLORS : DEFAULT_COLORS,
    auto: p ? '#ff0a54' : '#22c55e',
    teleop: p ? '#ff477e' : '#a855f7',
    endgame: p ? '#ff5c8a' : '#f59e0b',
    primary: p ? '#ff477e' : '#3b82f6',
    accent: p ? '#ff0a54' : '#f59e0b',
    scatter: p ? '#ff477e' : '#3b82f6',
    win: p ? '#ff0a54' : '#22c55e',
    loss: p ? '#ff85a1' : '#ef4444',
    tie: p ? '#fbb1bd' : '#94a3b8',
    line1: p ? '#ff0a54' : '#22c55e',
    line2: p ? '#ff85a1' : '#ef4444',
    line3: p ? '#ff7096' : '#f59e0b',
    trendLine: p ? '#ff0a54' : '#ef4444',
    grid: p ? '#fbb1bd' : '#334155',
    axis: p ? '#7a3b55' : '#94a3b8',
    tooltipBg: p ? '#ffffff' : '#1e293b',
    tooltipBorder: p ? '#ff99ac' : '#334155',
    tooltipText: p ? '#3d1228' : '#ffffff',
    tooltipMuted: p ? '#7a3b55' : '#94a3b8',
    prediction: p ? '#ff477e' : '#a855f7',
  };
}

function ttStyle(c: ReturnType<typeof useChartColors>) {
  return {
    contentStyle: { background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, fontSize: 12, color: c.tooltipText },
    labelStyle: { color: c.tooltipMuted },
    itemStyle: { color: c.tooltipText },
  };
}

/* ─── Utilities ─── */

function accuracyColor(error: number): string {
  if (error <= 5) return '#22c55e';
  if (error <= 15) return '#84cc16';
  if (error <= 25) return '#f59e0b';
  if (error <= 40) return '#f97316';
  return '#ef4444';
}

function truncate(s: string, len: number) {
  return s.length > len ? s.slice(0, len) + '...' : s;
}

/* ─── Toggle Button ─── */

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
        active
          ? 'bg-[var(--color-primary)] border-[var(--color-primary-light)] text-white'
          : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary-light)]'
      }`}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════
   1. EPA Distribution (Histogram)
   ═══════════════════════════════════════════ */

export function EPADistributionChart({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
  const c = useChartColors();
  const epas = teamEvents.map(te => te.epa.total_points.mean).sort((a, b) => a - b);
  if (epas.length === 0) return null;

  const min = Math.floor(epas[0]);
  const max = Math.ceil(epas[epas.length - 1]);
  const binSize = Math.max(1, Math.ceil((max - min) / 12));
  const bins: { range: string; count: number }[] = [];

  for (let s = min; s < max; s += binSize) {
    const end = s + binSize;
    bins.push({
      range: `${s.toFixed(0)}-${end.toFixed(0)}`,
      count: epas.filter(v => v >= s && v < end).length,
    });
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-0.5">EPA Distribution</h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">Histogram &mdash; frequency of teams by EPA range</p>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={bins} margin={{ top: 5, right: 10, bottom: 5, left: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis
            dataKey="range"
            stroke={c.axis}
            fontSize={10}
            angle={-30}
            textAnchor="end"
            height={45}
            interval={0}
          />
          <YAxis
            stroke={c.axis}
            fontSize={11}
            allowDecimals={false}
            width={35}
          />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.06)' }} {...ttStyle(c)} />
          <Bar dataKey="count" fill={c.primary} radius={[4, 4, 0, 0]} name="Teams" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. EPA vs Win Rate (Scatter + Trend Line)
   ═══════════════════════════════════════════ */

export function EPAScatterChart({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
  const c = useChartColors();
  const [playoffsOnly, setPlayoffsOnly] = useState(false);

  const filtered = playoffsOnly
    ? teamEvents.filter(te => (te.record.elim.wins + te.record.elim.losses + te.record.elim.ties) > 0)
    : teamEvents;

  const data = filtered.map(te => ({
    name: String(te.team),
    teamName: te.team_name,
    epa: Math.round(te.epa.total_points.mean),
    winrate: Math.round(
      (playoffsOnly
        ? te.record.elim.winrate
        : te.record.total.winrate) * 100
    ),
  }));

  // Regression forced through origin: slope = Σ(xi*yi) / Σ(xi²)
  const pts = data.map(d => ({ x: d.epa, y: d.winrate }));
  const sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
  const sxx = pts.reduce((s, p) => s + p.x * p.x, 0);
  const trendSlope = pts.length >= 2 && sxx !== 0 ? sxy / sxx : null;
  const maxEpa = data.length ? Math.max(...data.map(d => d.epa)) : 100;

  // Build trend line from (0,0) across the chart
  const trendData = trendSlope !== null ? [
    { epa: 0, trend: 0 },
    { epa: maxEpa + 5, trend: Math.min(100, trendSlope * (maxEpa + 5)) },
  ] : [];

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">EPA vs Win Rate</h3>
        <div className="flex gap-2">
          <ToggleBtn active={!playoffsOnly} onClick={() => setPlayoffsOnly(false)}>All Matches</ToggleBtn>
          <ToggleBtn active={playoffsOnly} onClick={() => setPlayoffsOnly(true)}>Playoffs Only</ToggleBtn>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No playoff data available for this event</p>
      ) : (
        <ResponsiveContainer width="100%" height={310}>
          <ComposedChart margin={{ top: 10, right: 20, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
            <XAxis
              dataKey="epa"
              name="EPA"
              type="number"
              stroke={c.axis}
              fontSize={11}
              allowDecimals={false}
              domain={[0, 'dataMax']}
              tickFormatter={(v: number) => String(Math.round(v))}
            />
            <YAxis
              dataKey="winrate"
              name="Win %"
              type="number"
              stroke={c.axis}
              fontSize={11}
              allowDecimals={false}
              domain={[0, 100]}
              tickFormatter={(v: number) => String(Math.round(v))}
              width={40}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: c.axis }}
              {...ttStyle(c)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={({ active, payload }: any) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                if (d.trend !== undefined) return null; // Don't show tooltip for trend line points
                return (
                  <div style={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                    <p style={{ color: c.tooltipText, margin: 0, fontWeight: 600 }}>Team {d.name}</p>
                    <p style={{ color: c.tooltipMuted, margin: '2px 0 0' }}>{d.teamName}</p>
                    <p style={{ color: c.tooltipMuted, margin: '2px 0 0' }}>EPA: {d.epa} &middot; Win: {d.winrate}%</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill={c.scatter} name="Teams" dataKey="winrate" />
            {trendData.length > 0 && (
              <Line
                data={trendData}
                dataKey="trend"
                stroke={c.trendLine}
                strokeDasharray="6 3"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                name="Trend"
                legendType="line"
                isAnimationActive={false}
              />
            )}
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. Top Teams Bar Chart (EPA or Win Rate)
   ═══════════════════════════════════════════ */

export function TopTeamsChart({ teamEvents, metric, title }: {
  teamEvents: StatboticsTeamEvent[];
  metric: 'epa' | 'winrate';
  title: string;
}) {
  const c = useChartColors();

  const data = [...teamEvents]
    .sort((a, b) => {
      if (metric === 'epa') return b.epa.total_points.mean - a.epa.total_points.mean;
      return b.record.total.winrate - a.record.total.winrate;
    })
    .slice(0, 10)
    .map(te => ({
      label: `${te.team} - ${truncate(te.team_name, 14)}`,
      team: te.team,
      teamName: te.team_name,
      rank: te.record.qual.rank || null,
      value: metric === 'epa' ? te.epa.total_points.mean : te.record.total.winrate * 100,
      metricLabel: metric === 'epa' ? 'EPA' : 'Win %',
    }));

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={310}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis
            type="number"
            stroke={c.axis}
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke={c.axis}
            fontSize={10}
            width={140}
            tick={{ fill: c.axis }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.06)' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={({ active, payload }: any) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                  <p style={{ color: c.tooltipText, margin: 0, fontWeight: 600 }}>Team {d.team}</p>
                  <p style={{ color: c.tooltipMuted, margin: '2px 0 0' }}>{d.teamName}</p>
                  <p style={{ color: c.accent, margin: '4px 0 0' }}>{d.metricLabel}: {d.value.toFixed(1)}{metric === 'winrate' ? '%' : ''}</p>
                  <p style={{ color: c.tooltipMuted, margin: '2px 0 0' }}>Rank: #{d.rank ?? '—'}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="value" fill={c.accent} radius={[0, 4, 4, 0]} name={metric === 'epa' ? 'EPA' : 'Win %'} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   4. EPA Component Breakdown (Top 15)
   ═══════════════════════════════════════════ */

type EPAComponent = 'Auto' | 'Teleop' | 'Endgame';

export function EPABreakdownChart({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
  const c = useChartColors();
  const [activeComponents, setActiveComponents] = useState<Set<EPAComponent>>(new Set(['Auto', 'Teleop', 'Endgame']));

  const toggleComponent = (comp: EPAComponent) => {
    setActiveComponents(prev => {
      const next = new Set(prev);
      if (next.has(comp)) {
        // Don't allow deselecting all
        if (next.size > 1) next.delete(comp);
      } else {
        next.add(comp);
      }
      return next;
    });
  };

  const data = teamEvents.map(te => {
    const bd = te.epa.breakdown || {};
    return {
      label: `${te.team}`,
      team: te.team,
      teamName: te.team_name,
      rank: te.record.qual.rank || null,
      Auto: bd.auto_points ?? 0,
      Teleop: bd.teleop_points ?? 0,
      Endgame: bd.endgame_points ?? 0,
      total: (bd.auto_points ?? 0) + (bd.teleop_points ?? 0) + (bd.endgame_points ?? 0),
    };
  })
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  const componentColors: Record<EPAComponent, string> = {
    Auto: c.auto,
    Teleop: c.teleop,
    Endgame: c.endgame,
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">EPA Component Breakdown (Top 15)</h3>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-[var(--color-text-muted)]">Show:</span>
        {(['Auto', 'Teleop', 'Endgame'] as EPAComponent[]).map(comp => (
          <ToggleBtn key={comp} active={activeComponents.has(comp)} onClick={() => toggleComponent(comp)}>
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: componentColors[comp] }} />
            {comp}
          </ToggleBtn>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis type="number" stroke={c.axis} fontSize={11} />
          <YAxis type="category" dataKey="label" stroke={c.axis} fontSize={11} width={55} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.06)' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={({ active, payload }: any) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                  <p style={{ color: c.tooltipText, margin: 0, fontWeight: 600 }}>Team {d.team} &mdash; {d.teamName}</p>
                  <p style={{ color: c.tooltipMuted, margin: '4px 0 2px' }}>Rank: #{d.rank ?? '—'}</p>
                  {activeComponents.has('Auto') && <p style={{ color: c.auto, margin: '2px 0 0' }}>Auto: {d.Auto.toFixed(1)}</p>}
                  {activeComponents.has('Teleop') && <p style={{ color: c.teleop, margin: '2px 0 0' }}>Teleop: {d.Teleop.toFixed(1)}</p>}
                  {activeComponents.has('Endgame') && <p style={{ color: c.endgame, margin: '2px 0 0' }}>Endgame: {d.Endgame.toFixed(1)}</p>}
                  <p style={{ color: c.tooltipText, margin: '4px 0 0', borderTop: `1px solid ${c.tooltipBorder}`, paddingTop: 4 }}>
                    Total: {(
                      (activeComponents.has('Auto') ? d.Auto : 0) +
                      (activeComponents.has('Teleop') ? d.Teleop : 0) +
                      (activeComponents.has('Endgame') ? d.Endgame : 0)
                    ).toFixed(1)}
                  </p>
                </div>
              );
            }}
          />
          {activeComponents.has('Auto') && <Bar dataKey="Auto" stackId="a" fill={componentColors.Auto} />}
          {activeComponents.has('Teleop') && <Bar dataKey="Teleop" stackId="a" fill={componentColors.Teleop} />}
          {activeComponents.has('Endgame') && <Bar dataKey="Endgame" stackId="a" fill={componentColors.Endgame} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   5. Predicted vs Actual Scores
   ═══════════════════════════════════════════ */

const ACCURACY_LEGEND = [
  { label: '0-5 pts', color: '#22c55e' },
  { label: '6-15 pts', color: '#84cc16' },
  { label: '16-25 pts', color: '#f59e0b' },
  { label: '26-40 pts', color: '#f97316' },
  { label: '40+ pts', color: '#ef4444' },
];

export function PredictionAccuracyChart({ matches }: { matches: StatboticsMatch[] }) {
  const c = useChartColors();
  const completed = matches.filter(m => m.status === 'Completed' && m.pred);
  if (completed.length === 0) return null;

  let correct = 0;
  const data = completed.map(m => {
    const predWinner = m.pred.red_win_prob > 0.5 ? 'red' : 'blue';
    const isCorrect = predWinner === m.result.winner;
    if (isCorrect) correct++;
    const actual = m.result.red_score + m.result.blue_score;
    const predicted = Math.round(m.pred.red_score + m.pred.blue_score);
    const error = Math.abs(predicted - actual);
    return {
      match: m.match_name,
      actual,
      predicted,
      error,
      color: accuracyColor(error),
    };
  });

  const accuracy = (correct / completed.length * 100).toFixed(1);

  // Sort data by actual score for clean axis ordering
  const sorted = [...data].sort((a, b) => a.actual - b.actual);
  const minScore = sorted.length ? sorted[0].actual : 0;
  const maxScore = sorted.length ? sorted[sorted.length - 1].actual : 200;

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">Predicted vs Actual Scores</h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-2">Winner prediction accuracy: {accuracy}% ({correct}/{completed.length})</p>
      {/* Accuracy legend -- inline badges */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
        <span className="text-xs text-[var(--color-text-muted)] font-medium">Error:</span>
        {ACCURACY_LEGEND.map(item => (
          <span key={item.label} className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <span className="w-2 h-2 rounded-sm inline-block shrink-0" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis
            dataKey="actual"
            name="Actual Score"
            type="number"
            stroke={c.axis}
            fontSize={11}
            domain={[Math.floor(minScore / 10) * 10, Math.ceil(maxScore / 10) * 10]}
            tickFormatter={(v: number) => String(Math.round(v))}
          />
          <YAxis
            dataKey="predicted"
            name="Predicted Score"
            type="number"
            stroke={c.axis}
            fontSize={11}
            width={45}
          />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: c.axis }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={({ active, payload }: any) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                    <p style={{ color: c.tooltipText, margin: 0, fontWeight: 600 }}>{d.match}</p>
                    <p style={{ color: c.tooltipMuted, margin: '4px 0 0' }}>Actual: {d.actual}</p>
                    <p style={{ color: c.tooltipMuted, margin: '2px 0 0' }}>Predicted: {d.predicted}</p>
                    <p style={{ color: d.color, margin: '2px 0 0', fontWeight: 600 }}>Error: {d.error} pts</p>
                  </div>
                );
              }}
            />
            <Scatter data={sorted} name="Matches">
              {sorted.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Scatter>
            {/* Perfect prediction reference line (y = x) */}
            {sorted.length > 0 && (
              <ReferenceLine
                segment={[
                  { x: Math.floor(minScore / 10) * 10, y: Math.floor(minScore / 10) * 10 },
                  { x: Math.ceil(maxScore / 10) * 10, y: Math.ceil(maxScore / 10) * 10 },
                ]}
                stroke={c.axis}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   6. Win Rate Donut Chart
   ═══════════════════════════════════════════ */

export function WinRateChart({ teamEvent }: { teamEvent: StatboticsTeamEvent }) {
  const c = useChartColors();
  const r = teamEvent.record.total;
  const data = [
    { name: 'Wins', value: r.wins },
    { name: 'Losses', value: r.losses },
    { name: 'Ties', value: r.ties },
  ].filter(d => d.value > 0);
  const colors = [c.win, c.loss, c.tie];

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Win Rate - Team {teamEvent.team}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
          </Pie>
          <Tooltip {...ttStyle(c)} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-lg font-bold text-[var(--color-text)]">{(r.winrate * 100).toFixed(0)}%</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   7. Match Score History
   ═══════════════════════════════════════════ */

export function MatchScoreChart({ matches, team }: { matches: StatboticsMatch[]; team: number }) {
  const c = useChartColors();
  const data = matches
    .filter(m => m.status === 'Completed')
    .sort((a, b) => a.match_number - b.match_number)
    .map(m => {
      const isRed = m.alliances.red.team_keys.includes(team);
      return {
        match: m.match_name,
        score: isRed ? m.result.red_score : m.result.blue_score,
        opponent: isRed ? m.result.blue_score : m.result.red_score,
        predicted: isRed ? m.pred?.red_score : m.pred?.blue_score,
      };
    });

  if (data.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Match Scores - Team {team}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis dataKey="match" stroke={c.axis} fontSize={10} angle={-45} textAnchor="end" height={50} />
          <YAxis stroke={c.axis} fontSize={11} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.06)' }} {...ttStyle(c)} />
          <Legend />
          <Line type="monotone" dataKey="score" stroke={c.line1} name="Team Score" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="opponent" stroke={c.line2} name="Opponent" strokeWidth={1} strokeDasharray="5 5" dot={{ r: 2 }} />
          {data[0]?.predicted != null && (
            <Line type="monotone" dataKey="predicted" stroke={c.line3} name="Predicted" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   8. Team Comparison Radar
   ═══════════════════════════════════════════ */

export function TeamComparisonRadar({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
  const c = useChartColors();
  if (teamEvents.length < 2) return null;

  const metrics = ['auto_points', 'teleop_points', 'endgame_points'];
  const metricLabels: Record<string, string> = {
    auto_points: 'Auto',
    teleop_points: 'Teleop',
    endgame_points: 'Endgame',
  };

  const maxVals: Record<string, number> = {};
  metrics.forEach(m => {
    maxVals[m] = Math.max(...teamEvents.map(te => te.epa.breakdown?.[m] ?? 0), 1);
  });

  const data = metrics.map(m => {
    const entry: Record<string, string | number> = { metric: metricLabels[m] };
    teamEvents.forEach(te => {
      entry[`Team ${te.team}`] = ((te.epa.breakdown?.[m] ?? 0) / maxVals[m] * 100);
    });
    return entry;
  });

  const maxEpa = Math.max(...teamEvents.map(te => te.epa.total_points.mean), 1);
  const epaEntry: Record<string, string | number> = { metric: 'EPA' };
  const wrEntry: Record<string, string | number> = { metric: 'Win Rate' };
  teamEvents.forEach(te => {
    epaEntry[`Team ${te.team}`] = (te.epa.total_points.mean / maxEpa * 100);
    wrEntry[`Team ${te.team}`] = te.record.total.winrate * 100;
  });
  data.push(epaEntry, wrEntry);

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
        Head-to-Head: {teamEvents.map(te => te.team).join(' vs ')}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data}>
          <PolarGrid stroke={c.grid} />
          <PolarAngleAxis dataKey="metric" stroke={c.axis} fontSize={11} />
          <PolarRadiusAxis stroke={c.grid} fontSize={10} />
          {teamEvents.map((te, i) => (
            <Radar key={te.team} name={`Team ${te.team}`} dataKey={`Team ${te.team}`} stroke={c.colors[i]} fill={c.colors[i]} fillOpacity={0.15} />
          ))}
          <Legend />
          <Tooltip {...ttStyle(c)} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
