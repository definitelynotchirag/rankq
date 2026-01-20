package repository

import (
	"context"

	"github.com/google/uuid"
)

type LeaderboardRepository interface {
	UpdateScore(ctx context.Context, userID uuid.UUID, rating int) error
	GetRank(ctx context.Context, rating int) (int64, error)
	GetTopUsers(ctx context.Context, start, stop int64) ([]LeaderboardMember, error)
	GetUserScore(ctx context.Context, userID uuid.UUID) (int, error)
	GetTotalCount(ctx context.Context) (int64, error)
	RemoveUser(ctx context.Context, userID uuid.UUID) error
	BulkLoad(ctx context.Context, scores map[uuid.UUID]int) error
}

type LeaderboardMember struct {
	UserID uuid.UUID
	Rating int
}
