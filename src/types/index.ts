export interface User {
  id: string;
  username: string;
  rating: number;
  rank: number;
  previousRank?: number;
}

export interface LeaderboardEntry extends User {
  user_id?: string;
  rankChange?: 'up' | 'down' | 'same';
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface SearchResponse {
  data: SearchResult[];
}

export interface SearchResult {
  rank: number;
  username: string;
  rating: number;
  user_id: string;
}

export interface UserRankResponse {
  data: SearchResult;
}

export interface CreateUserRequest {
  username: string;
  initial_rating?: number;
}

export interface CreateUserResponse {
  data: {
    id: string;
    username: string;
    created_at: string;
  };
}

export interface UpdateScoreRequest {
  rating: number;
}

export interface SimulationStatusResponse {
  running: boolean;
}

export interface ApiError {
  error: string;
}
