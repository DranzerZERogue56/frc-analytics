// Statbotics Types
export interface StatboticsEvent {
  key: string;
  year: number;
  name: string;
  time: number;
  country: string;
  state: string | null;
  district: string | null;
  start_date: string;
  end_date: string;
  type: string;
  week: number;
  video: string | null;
  status: string;
  status_str: string;
  num_teams: number;
  current_match: number;
  qual_matches: number;
  epa: {
    max: number;
    top_8: number;
    top_24: number;
    mean: number;
    sd: number;
  };
}

export interface StatboticsTeam {
  team: number;
  name: string;
  country: string;
  state: string | null;
  district: string | null;
  rookie_year: number;
  active: boolean;
  last_active_year: number;
  wins: number;
  losses: number;
  ties: number;
  count: number;
  winrate: number;
  current: number;
  recent: number;
  mean: number;
  max: number;
}

export interface EPABreakdown {
  total_points: { mean: number; sd: number };
  unitless: number;
  norm: number;
  conf: [number, number];
  breakdown: Record<string, number>;
  stats: {
    start: number;
    pre_elim: number;
    mean: number;
    max: number;
  };
}

export interface StatboticsTeamEvent {
  team: number;
  year: number;
  event: string;
  time: number;
  team_name: string;
  event_name: string;
  country: string;
  state: string | null;
  district: string | null;
  type: string;
  week: number;
  status: string;
  first_event: boolean;
  district_points: number | null;
  epa: EPABreakdown;
  record: {
    qual: { wins: number; losses: number; ties: number; winrate: number; rank: number; num_teams: number };
    elim: { wins: number; losses: number; ties: number; winrate: number };
    total: { wins: number; losses: number; ties: number; winrate: number; count: number };
  };
}

export interface StatboticsMatch {
  key: string;
  year: number;
  event: string;
  week: number;
  match_name: string;
  match_number: number;
  comp_level: string;
  set_number: number;
  elim: boolean;
  time: number;
  status: string;
  video: string | null;
  alliances: {
    red: { team_keys: number[]; surrogate_team_keys: number[]; dq_team_keys: number[] };
    blue: { team_keys: number[]; surrogate_team_keys: number[]; dq_team_keys: number[] };
  };
  pred: {
    winner: string;
    red_win_prob: number;
    red_score: number;
    blue_score: number;
  };
  result: {
    winner: string;
    red_score: number;
    blue_score: number;
    red_no_foul: number;
    blue_no_foul: number;
  };
}

// UI filter types
export type EventStatus = 'all' | 'Upcoming' | 'Ongoing' | 'Completed';
export type EventType = 'all' | 'regional' | 'district' | 'district_cmp' | 'champs' | 'offseason';

export interface EventFilters {
  status: EventStatus;
  type: EventType;
  week: string;
  district: string;
  search: string;
}
