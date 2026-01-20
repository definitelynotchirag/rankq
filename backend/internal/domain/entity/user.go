package entity

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

type UserScore struct {
	UserID    uuid.UUID `json:"user_id"`
	Rating    int       `json:"rating"`
	UpdatedAt time.Time `json:"updated_at"`
}

type LeaderboardEntry struct {
	Rank     int64  `json:"rank"`
	Username string `json:"username"`
	Rating   int    `json:"rating"`
	UserID   string `json:"user_id"`
}

type SearchResult struct {
	Rank     int64  `json:"rank"`
	Username string `json:"username"`
	Rating   int    `json:"rating"`
	UserID   string `json:"user_id"`
}

func NewUser(username string) *User {
	return &User{
		ID:        uuid.New(),
		Username:  username,
		CreatedAt: time.Now(),
	}
}

func NewUserScore(userID uuid.UUID, rating int) *UserScore {
	return &UserScore{
		UserID:    userID,
		Rating:    rating,
		UpdatedAt: time.Now(),
	}
}
