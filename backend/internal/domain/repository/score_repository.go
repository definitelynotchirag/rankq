package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/rankq/backend/internal/domain/entity"
)

type ScoreRepository interface {
	Upsert(ctx context.Context, score *entity.UserScore) error
	GetByUserID(ctx context.Context, userID uuid.UUID) (*entity.UserScore, error)
	GetByUserIDs(ctx context.Context, userIDs []uuid.UUID) (map[uuid.UUID]*entity.UserScore, error)
	GetAll(ctx context.Context) ([]*entity.UserScore, error)
}
