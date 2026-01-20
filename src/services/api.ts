import { API_CONFIG } from '../config/api';
import {
  CreateUserRequest,
  CreateUserResponse,
  LeaderboardEntry,
  LeaderboardResponse,
  SearchResponse,
  SimulationStatusResponse,
  UpdateScoreRequest,
  UserRankResponse,
} from '../types';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async getLeaderboard(page: number = 1, pageSize: number = 20): Promise<LeaderboardResponse> {
    return this.request<LeaderboardResponse>(
      `/leaderboard?page=${page}&page_size=${pageSize}`
    );
  }

  async searchUsers(query: string, limit: number = 20): Promise<SearchResponse> {
    return this.request<SearchResponse>(
      `/leaderboard/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async getUserRank(userId: string): Promise<UserRankResponse> {
    return this.request<UserRankResponse>(`/leaderboard/user/${userId}`);
  }

  async updateScore(userId: string, rating: number): Promise<void> {
    const body: UpdateScoreRequest = { rating };
    await this.request(`/leaderboard/user/${userId}/score`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async rebuildLeaderboard(): Promise<void> {
    await this.request('/leaderboard/rebuild', { method: 'POST' });
  }

  async createUser(username: string, initialRating?: number): Promise<CreateUserResponse> {
    const body: CreateUserRequest = { username, initial_rating: initialRating };
    return this.request<CreateUserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async startSimulation(intervalMs: number = 1000, updatesPerTick: number = 5): Promise<void> {
    await this.request('/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ interval_ms: intervalMs, updates_per_tick: updatesPerTick }),
    });
  }

  async stopSimulation(): Promise<void> {
    await this.request('/simulation/stop', { method: 'POST' });
  }

  async getSimulationStatus(): Promise<SimulationStatusResponse> {
    return this.request<SimulationStatusResponse>('/simulation/status');
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient();

export const fetchLeaderboard = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ entries: LeaderboardEntry[]; total: number; hasMore: boolean }> => {
  const response = await apiClient.getLeaderboard(page, pageSize);

  const entries: LeaderboardEntry[] = response.data.map(entry => ({
    id: entry.user_id || entry.id || '',
    username: entry.username,
    rating: entry.rating,
    rank: entry.rank,
    user_id: entry.user_id,
  }));

  return {
    entries,
    total: response.meta.total,
    hasMore: response.meta.page < response.meta.total_pages,
  };
};

export const searchUsers = async (
  query: string
): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.searchUsers(query);

  return response.data.map(result => ({
    id: result.user_id,
    username: result.username,
    rating: result.rating,
    rank: result.rank,
    user_id: result.user_id,
  }));
};

export const calculateRankChanges = (
  currentData: LeaderboardEntry[],
  newData: LeaderboardEntry[]
): LeaderboardEntry[] => {
  const previousRanks = new Map<string, number>();
  currentData.forEach(entry => {
    previousRanks.set(entry.id, entry.rank);
  });

  return newData.map(entry => {
    const previousRank = previousRanks.get(entry.id);
    let rankChange: 'up' | 'down' | 'same' | undefined;

    if (previousRank !== undefined) {
      if (entry.rank < previousRank) {
        rankChange = 'up';
      } else if (entry.rank > previousRank) {
        rankChange = 'down';
      } else {
        rankChange = 'same';
      }
    }

    return {
      ...entry,
      previousRank,
      rankChange,
    };
  });
};
