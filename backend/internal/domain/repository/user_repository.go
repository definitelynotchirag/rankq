package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/rankq/backend/internal/domain/entity"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
	GetByUsername(ctx context.Context, username string) (*entity.User, error)
	GetByIDs(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]*entity.User, error)
	Search(ctx context.Context, query string, limit int) ([]*entity.User, error)
	List(ctx context.Context, limit, offset int) ([]*entity.User, error)
	Count(ctx context.Context) (int64, error)
}
