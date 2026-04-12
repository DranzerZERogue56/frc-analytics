import type { StatboticsEvent, StatboticsTeam, StatboticsTeamEvent, StatboticsMatch } from '../types';

const BASE = 'https://api.statbotics.io/v3';

async function fetchJson<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Statbotics ${res.status}: ${path}`);
  return res.json();
}

export async function getEvents(year: number): Promise<StatboticsEvent[]> {
  return fetchJson<StatboticsEvent[]>('/events', { year, limit: 500 });
}

export async function getEvent(eventKey: string): Promise<StatboticsEvent> {
  return fetchJson<StatboticsEvent>(`/event/${eventKey}`);
}

export async function getTeamEvents(eventKey: string): Promise<StatboticsTeamEvent[]> {
  return fetchJson<StatboticsTeamEvent[]>('/team_events', { event: eventKey, limit: 200 });
}

export async function getTeamEvent(team: number, eventKey: string): Promise<StatboticsTeamEvent> {
  return fetchJson<StatboticsTeamEvent>(`/team_event/${team}/${eventKey}`);
}

export async function getTeam(team: number): Promise<StatboticsTeam> {
  return fetchJson<StatboticsTeam>(`/team/${team}`);
}

export async function getTeamYearEvents(team: number, year: number): Promise<StatboticsTeamEvent[]> {
  return fetchJson<StatboticsTeamEvent[]>('/team_events', { team, year, limit: 50 });
}

export async function getMatches(eventKey: string): Promise<StatboticsMatch[]> {
  return fetchJson<StatboticsMatch[]>('/matches', { event: eventKey, limit: 500 });
}

export async function getTeamMatches(team: number, eventKey: string): Promise<StatboticsMatch[]> {
  const matches = await getMatches(eventKey);
  return matches.filter(m =>
    m.alliances.red.team_keys.includes(team) ||
    m.alliances.blue.team_keys.includes(team)
  );
}
