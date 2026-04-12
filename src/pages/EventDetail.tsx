import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEvent, getTeamEvents, getMatches } from '../api/statbotics';
import { formatDate, getEventTypeLabel, getStatusBadgeClasses } from '../utils/helpers';
import { TeamTable } from '../components/TeamTable';
import { MatchList } from '../components/MatchList';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
import {
  EPABreakdownChart,
  WinRateChart,
  EPAScatterChart,
  EPADistributionChart,
  MatchScoreChart,
  TeamComparisonRadar,
  TopTeamsChart,
  PredictionAccuracyChart,
} from '../components/Charts';
import type { StatboticsTeamEvent } from '../types';

type Tab = 'teams' | 'matches' | 'stats' | 'compare';

export function EventDetail() {
  const { eventKey } = useParams<{ eventKey: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('teams');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventKey],
    queryFn: () => getEvent(eventKey!),
    enabled: !!eventKey,
  });

  const { data: teamEvents, isLoading: teamsLoading } = useQuery({
    queryKey: ['teamEvents', eventKey],
    queryFn: () => getTeamEvents(eventKey!),
    enabled: !!eventKey,
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', eventKey],
    queryFn: () => getMatches(eventKey!),
    enabled: !!eventKey,
    staleTime: event?.status === 'Ongoing' ? 60_000 : 5 * 60_000,
  });

  const selectedTeamEvents = (teamEvents ?? []).filter(te => selectedTeams.includes(te.team));

  const toggleTeam = (team: number) => {
    setSelectedTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : prev.length < 3 ? [...prev, team] : prev
    );
  };

  if (eventLoading) return <LoadingSpinner message="Loading event..." />;
  if (eventError || !event) return <ErrorMessage message="Failed to load event" />;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'teams', label: 'Teams', count: teamEvents?.length },
    { key: 'matches', label: 'Matches', count: matches?.length },
    { key: 'stats', label: 'Stats' },
    { key: 'compare', label: 'Compare', count: selectedTeams.length || undefined },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-[var(--color-text-muted)] mb-3 sm:mb-4">
        <Link to="/" className="hover:text-white no-underline">Events</Link>
        <span className="mx-2">/</span>
        <span className="text-white truncate">{event.name}</span>
      </div>

      {/* Event Header */}
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">{event.name}</h1>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--color-text-muted)]">
              <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
              <span>{event.state ? `${event.state}, ${event.country}` : event.country}</span>
              <span>{getEventTypeLabel(event.type)}</span>
              <span>Week {event.week}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className={`text-xs px-3 py-1 rounded-full border ${getStatusBadgeClasses(event.status)}`}>
              {event.status === 'Ongoing' && <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />}
              {event.status}
            </span>
            {event.video && (
              <a href={event.video} target="_blank" rel="noreferrer" className="text-xs bg-red-600 text-white px-3 py-1 rounded-full no-underline hover:bg-red-500">
                Watch
              </a>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
          <StatBox label="Teams" value={event.num_teams} />
          <StatBox label="Avg EPA" value={event.epa?.mean?.toFixed(1) ?? '—'} color="text-blue-400" />
          <StatBox label="Max EPA" value={event.epa?.max?.toFixed(1) ?? '—'} color="text-yellow-400" />
          <StatBox label="Top 8" value={event.epa?.top_8?.toFixed(1) ?? '—'} color="text-green-400" />
          <StatBox label="Matches" value={event.current_match || '—'} />
        </div>
      </div>

      {/* Tabs - scrollable on mobile */}
      <div className="flex gap-1 mb-0 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'bg-[var(--color-surface)] text-white border border-[var(--color-border)] border-b-transparent'
                : 'text-[var(--color-text-muted)] hover:text-white'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}{tab.count != null ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] rounded-b-lg rounded-tr-lg border border-[var(--color-border)] p-3 sm:p-6">
        {/* Teams Tab */}
        {activeTab === 'teams' && (
          teamsLoading ? <LoadingSpinner message="Loading teams..." /> : teamEvents ? (
            <TeamTable teamEvents={teamEvents} selectedTeams={selectedTeams} onToggleTeam={toggleTeam} />
          ) : <ErrorMessage message="No team data" />
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          matchesLoading ? <LoadingSpinner message="Loading matches..." /> : matches ? (
            <MatchList matches={matches} highlightTeam={selectedTeams[0]} />
          ) : <ErrorMessage message="No match data" />
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && teamEvents && matches && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <EPADistributionChart teamEvents={teamEvents} />
            <EPAScatterChart teamEvents={teamEvents} />
            <TopTeamsChart teamEvents={teamEvents} metric="epa" title="Top 10 by EPA" />
            <TopTeamsChart teamEvents={teamEvents} metric="winrate" title="Top 10 by Win Rate" />
            <EPABreakdownChart teamEvents={teamEvents} />
            <PredictionAccuracyChart matches={matches} />
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          selectedTeams.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-[var(--color-text-muted)]">
              <p className="text-base sm:text-lg mb-2">No teams selected</p>
              <p className="text-sm">Go to the Teams tab and tap on 2-3 teams to compare</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Comparison Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {selectedTeamEvents.map(te => (
                  <CompareCard key={te.team} teamEvent={te} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <TeamComparisonRadar teamEvents={selectedTeamEvents} />
                {selectedTeamEvents.map(te => (
                  <WinRateChart key={te.team} teamEvent={te} />
                ))}
                {matches && selectedTeams.map(team => (
                  <MatchScoreChart key={team} matches={matches.filter(m =>
                    m.alliances.red.team_keys.includes(team) || m.alliances.blue.team_keys.includes(team)
                  )} team={team} />
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color = 'text-white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mb-0.5 sm:mb-1">{label}</p>
      <p className={`text-base sm:text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function CompareCard({ teamEvent: te }: { teamEvent: StatboticsTeamEvent }) {
  return (
    <div className="bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] p-3 sm:p-4">
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className="min-w-0">
          <p className="text-blue-400 font-bold text-base sm:text-lg">{te.team}</p>
          <p className="text-white text-xs sm:text-sm truncate">{te.team_name}</p>
        </div>
        <span className="text-xs text-[var(--color-text-muted)] shrink-0 ml-2">#{te.record.qual.rank || '—'}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
        <div><span className="text-[var(--color-text-muted)]">EPA:</span> <span className="text-yellow-400 font-bold">{te.epa.total_points.mean.toFixed(1)}</span></div>
        <div><span className="text-[var(--color-text-muted)]">Win%:</span> <span className="text-white font-bold">{(te.record.total.winrate * 100).toFixed(0)}%</span></div>
        <div><span className="text-[var(--color-text-muted)]">Auto:</span> <span className="text-green-400">{te.epa.breakdown?.auto_points?.mean?.toFixed(1) ?? '—'}</span></div>
        <div><span className="text-[var(--color-text-muted)]">Teleop:</span> <span className="text-purple-400">{te.epa.breakdown?.teleop_points?.mean?.toFixed(1) ?? '—'}</span></div>
        <div><span className="text-[var(--color-text-muted)]">Endgame:</span> <span className="text-orange-400">{te.epa.breakdown?.endgame_points?.mean?.toFixed(1) ?? '—'}</span></div>
        <div><span className="text-[var(--color-text-muted)]">Record:</span> <span className="text-white">{te.record.total.wins}-{te.record.total.losses}-{te.record.total.ties}</span></div>
      </div>
    </div>
  );
}
