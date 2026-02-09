
export enum AppRoute {
  HOME = 'home',
  CANBALL = 'canball',
  PROFILE = 'profile',
  MATCH_FORM = 'match_form',
  HISTORY = 'history',
  RANKING = 'ranking',
  ADMIN = 'admin',
  SIGNUP = 'signup',
  LOGIN = 'login',
  TIER_GUIDE = 'tier_guide',
  MY_SCORES = 'my_scores'
}

export interface User {
  id: string;
  name: string;
  studentId: string;
  rank: number;
  tier: 'Gold' | 'Silver' | 'Bronze';
  singlesPoint: number;
  doublesPoint: number;
  isAdmin: boolean;
  avatar?: string;
  role: 'admin' | 'member';
  status: 'approved' | 'pending';
}

export interface MatchRecord {
  id: string;
  date: string;
  time: string;
  type: 'Singles' | 'Doubles';
  winner: string[];
  loser: string[];
  score: string;
  month: string;
}

export interface JoinRequest {
  id: string;
  name: string;
  studentId: string;
  type: 'Admin Request' | 'Member Request';
  time: string;
  avatar?: string;
}

export interface ApprovalRequest {
  id: string;
  name: string;
  studentId: string;
  role: 'admin' | 'member';
  createdAt: string;
  avatar?: string;
}
