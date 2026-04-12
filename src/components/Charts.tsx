import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  ScatterChart, Scatter, CartesianGrid,
  LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import type { StatboticsTeamEvent, StatboticsMatch } from '../types';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];

const tooltipStyle = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
};

// EPA Component Breakdown Bar Chart
export function EPABreakdownChart({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
  const data = teamEvents.map(te => {
    const bd = te.epa.breakdown || {};
    return {
      name: `${te.team}`,
      Auto: bd.auto_points?.mean ?? 0,
      Teleop: bd.teleop_points?.mean ?? 0,
      Endgame: bd.endgame_points?.mean ?? 0,
    };
  }).sort((a, b) => (b.Auto + b.Teleop + b.Endgame) - (a.Auto + a.Teleop + a.Endgame))
    .slice(0, 15);

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">EPA Component Breakdown (Top 15)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={50} />
          <Tooltip {...tooltipStyle} />
          <Legend />
          <Bar dataKey="Auto" stackId="a" fill="#22c55e" />
          <Bar dataKey="Teleop" stackId="a" fill="#a855f7" />
          <Bar dataKey="Endgame" stackId="a" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Win Rate Donut Chart
export function WinRateChart({ teamEvent }: { teamEvent: StatboticsTeamEvent }) {
  const r = teamEvent.record.total;
  const data = [
    { name: 'Wins', value: r.wins },
    { name: 'Losses', value: r.losses },
    { name: 'Ties', value: r.ties },
  ].filter(d => d.value > 0);
  const colors = ['#22c55e', '#ef4444', '#94a3b8'];

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Win Rate - Team {teamEvent.team}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-lg font-bold text-white">{(r.winrate * 100).toFixed(0)}%</p>
    </div>
  );
}

// EPA Distribution Scatter
export function EPAScatterChart({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
  const data = teamEvents.map(te => ({
    name: String(te.team),
    epa: te.epa.total_points.mean,
    winrate: te.record.total.winrate * 100,
  }));

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">EPA vs Win Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="epa" name="EPA" stroke="#94a3b8" fontSize={11} label={{ value: 'EPA', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
          <YAxis dataKey="winrate" name="Win%" stroke="#94a3b8" fontSize={11} label={{ value: 'Win%', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip {...tooltipStyle} formatter={(val) => typeof val === 'number' ? val.toFixed(1) : String(val)} />
          <Scatter data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// EPA Distribution Histogram
export function EPADistributionChart({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
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
      <h3 className="text-sm font-semibold text-white mb-3">EPA Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={50} />
          <YAxis stroke="#94a3b8" fontSize={11} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Match Score History for a team
export function MatchScoreChart({ matches, team }: { matches: StatboticsMatch[]; team: number }) {
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
      <h3 className="text-sm font-semibold text-white mb-3">Match Scores - Team {team}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="match" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={50} />
          <YAxis stroke="#94a3b8" fontSize={11} />
          <Tooltip {...tooltipStyle} />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#22c55e" name="Team Score" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="opponent" stroke="#ef4444" name="Opponent" strokeWidth={1} strokeDasharray="5 5" dot={{ r: 2 }} />
          {data[0]?.predicted != null && (
            <Line type="monotone" dataKey="predicted" stroke="#f59e0b" name="Predicted" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Team Comparison Radar
export function TeamComparisonRadar({ teamEvents }: { teamEvents: StatboticsTeamEvent[] }) {
  if (teamEvents.length < 2) return null;

  const metrics = ['auto_points', 'teleop_points', 'endgame_points'];
  const metricLabels: Record<string, string> = {
    auto_points: 'Auto',
    teleop_points: 'Teleop',
    endgame_points: 'Endgame',
  };

  // Normalize values for radar
  const maxVals: Record<string, number> = {};
  metrics.forEach(m => {
    maxVals[m] = Math.max(...teamEvents.map(te => te.epa.breakdown?.[m]?.mean ?? 0), 1);
  });

  const data = metrics.map(m => {
    const entry: Record<string, string | number> = { metric: metricLabels[m] };
    teamEvents.forEach(te => {
      entry[`Team ${te.team}`] = ((te.epa.breakdown?.[m]?.mean ?? 0) / maxVals[m] * 100);
    });
    return entry;
  });

  // Add winrate and EPA
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
      <h3 className="text-sm font-semibold text-white mb-3">
        Head-to-Head: {teamEvents.map(te => te.team).join(' vs ')}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
          <PolarRadiusAxis stroke="#334155" fontSize={10} />
          {teamEvents.map((te, i) => (
            <Radar key={te.team} name={`Team ${te.team}`} dataKey={`Team ${te.team}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
          ))}
          <Legend />
          <Tooltip {...tooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Top Teams Bar Chart
export function TopTeamsChart({ teamEvents, metric, title }: {
  teamEvents: StatboticsTeamEvent[];
  metric: 'epa' | 'winrate';
  title: string;
}) {
  const data = [...teamEvents]
    .sort((a, b) => {
      if (metric === 'epa') return b.epa.total_points.mean - a.epa.total_points.mean;
      return b.record.total.winrate - a.record.total.winrate;
    })
    .slice(0, 10)
    .map(te => ({
      name: String(te.team),
      value: metric === 'epa' ? te.epa.total_points.mean : te.record.total.winrate * 100,
    }));

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={50} />
          <Tooltip {...tooltipStyle} formatter={(val) => typeof val === 'number' ? val.toFixed(1) : String(val)} />
          <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Prediction Accuracy Chart
export function PredictionAccuracyChart({ matches }: { matches: StatboticsMatch[] }) {
  const completed = matches.filter(m => m.status === 'Completed' && m.pred);
  if (completed.length === 0) return null;

  let correct = 0;
  const data = completed.map(m => {
    const predWinner = m.pred.red_win_prob > 0.5 ? 'red' : 'blue';
    const isCorrect = predWinner === m.result.winner;
    if (isCorrect) correct++;
    return {
      match: m.match_name,
      predicted: Math.round(m.pred.red_score + m.pred.blue_score),
      actual: m.result.red_score + m.result.blue_score,
    };
  });

  const accuracy = (correct / completed.length * 100).toFixed(1);

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <h3 className="text-sm font-semibold text-white mb-1">Predicted vs Actual Scores</h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">Winner prediction accuracy: {accuracy}% ({correct}/{completed.length})</p>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="predicted" name="Predicted" stroke="#94a3b8" fontSize={11} label={{ value: 'Predicted Total', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
          <YAxis dataKey="actual" name="Actual" stroke="#94a3b8" fontSize={11} label={{ value: 'Actual Total', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Scatter data={data} fill="#a855f7" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
