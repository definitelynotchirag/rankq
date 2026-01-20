package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/rankq/backend/internal/domain/entity"
	"github.com/rankq/backend/internal/domain/repository"
)

var (
	ErrUserExists   = errors.New("user already exists")
	ErrUserNotFound = errors.New("user not found")
)

type UserService struct {
	userRepo        repository.UserRepository
	scoreRepo       repository.ScoreRepository
	leaderboardRepo repository.LeaderboardRepository
}

func NewUserService(
	userRepo repository.UserRepository,
	scoreRepo repository.ScoreRepository,
	leaderboardRepo repository.LeaderboardRepository,
) *UserService {
	return &UserService{
		userRepo:        userRepo,
		scoreRepo:       scoreRepo,
		leaderboardRepo: leaderboardRepo,
	}
}

func (s *UserService) CreateUser(ctx context.Context, username string, initialRating int) (*entity.User, error) {
	existing, err := s.userRepo.GetByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrUserExists
	}

	user := entity.NewUser(username)
	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	if initialRating < 100 {
		initialRating = 100
	}
	if initialRating > 5000 {
		initialRating = 5000
	}

	score := &entity.UserScore{
		UserID:    user.ID,
		Rating:    initialRating,
		UpdatedAt: time.Now(),
	}

	if err := s.scoreRepo.Upsert(ctx, score); err != nil {
		return nil, err
	}

	if err := s.leaderboardRepo.UpdateScore(ctx, user.ID, initialRating); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

func (s *UserService) ListUsers(ctx context.Context, limit, offset int) ([]*entity.User, error) {
	return s.userRepo.List(ctx, limit, offset)
}

func (s *UserService) GetTotalUsers(ctx context.Context) (int64, error) {
	return s.userRepo.Count(ctx)
}
