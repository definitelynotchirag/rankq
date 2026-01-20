package service

import (
	"context"
	"sort"
	"time"

	"github.com/google/uuid"
	"github.com/rankq/backend/internal/domain/entity"
	"github.com/rankq/backend/internal/domain/repository"
)

type LeaderboardService struct {
	userRepo        repository.UserRepository
	scoreRepo       repository.ScoreRepository
	leaderboardRepo repository.LeaderboardRepository
}

func NewLeaderboardService(
	userRepo repository.UserRepository,
	scoreRepo repository.ScoreRepository,
	leaderboardRepo repository.LeaderboardRepository,
) *LeaderboardService {
	return &LeaderboardService{
		userRepo:        userRepo,
		scoreRepo:       scoreRepo,
		leaderboardRepo: leaderboardRepo,
	}
}

func (s *LeaderboardService) GetLeaderboard(ctx context.Context, page, pageSize int) ([]entity.LeaderboardEntry, int64, error) {
	start := int64((page - 1) * pageSize)
	stop := start + int64(pageSize) - 1

	members, err := s.leaderboardRepo.GetTopUsers(ctx, start, stop)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.leaderboardRepo.GetTotalCount(ctx)
	if err != nil {
		return nil, 0, err
	}

	if len(members) == 0 {
		return []entity.LeaderboardEntry{}, total, nil
	}

	userIDs := make([]uuid.UUID, len(members))
	for i, m := range members {
		userIDs[i] = m.UserID
	}

	users, err := s.userRepo.GetByIDs(ctx, userIDs)
	if err != nil {
		return nil, 0, err
	}

	ratingRanks := make(map[int]int64)
	entries := make([]entity.LeaderboardEntry, 0, len(members))

	for _, m := range members {
		rank, exists := ratingRanks[m.Rating]
		if !exists {
			rank, err = s.leaderboardRepo.GetRank(ctx, m.Rating)
			if err != nil {
				return nil, 0, err
			}
			ratingRanks[m.Rating] = rank
		}

		user, ok := users[m.UserID]
		if !ok {
			continue
		}

		entries = append(entries, entity.LeaderboardEntry{
			Rank:     rank,
			Username: user.Username,
			Rating:   m.Rating,
			UserID:   m.UserID.String(),
		})
	}

	return entries, total, nil
}

func (s *LeaderboardService) Search(ctx context.Context, query string, limit int) ([]entity.SearchResult, error) {
	users, err := s.userRepo.Search(ctx, query, limit)
	if err != nil {
		return nil, err
	}

	if len(users) == 0 {
		return []entity.SearchResult{}, nil
	}

	results := make([]entity.SearchResult, 0, len(users))

	for _, user := range users {
		rating, err := s.leaderboardRepo.GetUserScore(ctx, user.ID)
		if err != nil {
			continue
		}

		rank, err := s.leaderboardRepo.GetRank(ctx, rating)
		if err != nil {
			continue
		}

		results = append(results, entity.SearchResult{
			Rank:     rank,
			Username: user.Username,
			Rating:   rating,
			UserID:   user.ID.String(),
		})
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Rank < results[j].Rank
	})

	return results, nil
}

func (s *LeaderboardService) UpdateScore(ctx context.Context, userID uuid.UUID, rating int) error {
	if rating < 100 {
		rating = 100
	}
	if rating > 5000 {
		rating = 5000
	}

	if err := s.leaderboardRepo.UpdateScore(ctx, userID, rating); err != nil {
		return err
	}

	score := &entity.UserScore{
		UserID:    userID,
		Rating:    rating,
		UpdatedAt: time.Now(),
	}

	return s.scoreRepo.Upsert(ctx, score)
}

func (s *LeaderboardService) GetUserRank(ctx context.Context, userID uuid.UUID) (*entity.SearchResult, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, nil
	}

	rating, err := s.leaderboardRepo.GetUserScore(ctx, userID)
	if err != nil {
		return nil, err
	}

	rank, err := s.leaderboardRepo.GetRank(ctx, rating)
	if err != nil {
		return nil, err
	}

	return &entity.SearchResult{
		Rank:     rank,
		Username: user.Username,
		Rating:   rating,
		UserID:   user.ID.String(),
	}, nil
}

func (s *LeaderboardService) RebuildFromPostgres(ctx context.Context) error {
	scores, err := s.scoreRepo.GetAll(ctx)
	if err != nil {
		return err
	}

	scoreMap := make(map[uuid.UUID]int, len(scores))
	for _, score := range scores {
		scoreMap[score.UserID] = score.Rating
	}

	return s.leaderboardRepo.BulkLoad(ctx, scoreMap)
}
