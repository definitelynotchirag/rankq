package database

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/rankq/backend/internal/domain/entity"
	"github.com/rankq/backend/internal/domain/repository"
)

type scoreRepository struct {
	db *sql.DB
}

func NewScoreRepository(db *sql.DB) repository.ScoreRepository {
	return &scoreRepository{db: db}
}

func (r *scoreRepository) Upsert(ctx context.Context, score *entity.UserScore) error {
	query := `
		INSERT INTO user_scores (user_id, rating, updated_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id)
		DO UPDATE SET rating = $2, updated_at = $3
	`
	_, err := r.db.ExecContext(ctx, query, score.UserID, score.Rating, score.UpdatedAt)
	return err
}

func (r *scoreRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*entity.UserScore, error) {
	query := `SELECT user_id, rating, updated_at FROM user_scores WHERE user_id = $1`
	score := &entity.UserScore{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&score.UserID, &score.Rating, &score.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return score, nil
}

func (r *scoreRepository) GetByUserIDs(ctx context.Context, userIDs []uuid.UUID) (map[uuid.UUID]*entity.UserScore, error) {
	if len(userIDs) == 0 {
		return make(map[uuid.UUID]*entity.UserScore), nil
	}

	placeholders := make([]string, len(userIDs))
	args := make([]interface{}, len(userIDs))
	for i, id := range userIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(
		`SELECT user_id, rating, updated_at FROM user_scores WHERE user_id IN (%s)`,
		strings.Join(placeholders, ","),
	)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	scores := make(map[uuid.UUID]*entity.UserScore)
	for rows.Next() {
		score := &entity.UserScore{}
		if err := rows.Scan(&score.UserID, &score.Rating, &score.UpdatedAt); err != nil {
			return nil, err
		}
		scores[score.UserID] = score
	}

	return scores, rows.Err()
}

func (r *scoreRepository) GetAll(ctx context.Context) ([]*entity.UserScore, error) {
	query := `SELECT user_id, rating, updated_at FROM user_scores`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scores []*entity.UserScore
	for rows.Next() {
		score := &entity.UserScore{}
		if err := rows.Scan(&score.UserID, &score.Rating, &score.UpdatedAt); err != nil {
			return nil, err
		}
		scores = append(scores, score)
	}

	return scores, rows.Err()
}
