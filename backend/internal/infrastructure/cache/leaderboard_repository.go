package cache

import (
	"context"
	"strconv"

	"github.com/google/uuid"
	"github.com/rankq/backend/internal/domain/repository"
	"github.com/redis/go-redis/v9"
)

const (
	leaderboardKey = "leaderboard:users"
	ratingsKey = "leaderboard:ratings"
	ratingCountsKey = "leaderboard:rating_counts"
)

const updateScoreScript = `
local usersKey = KEYS[1]
local ratingsKey = KEYS[2]
local countsKey = KEYS[3]
local userID = ARGV[1]
local newRating = tonumber(ARGV[2])

-- Get old rating
local oldRating = redis.call('ZSCORE', usersKey, userID)

-- If user exists, handle old rating cleanup
if oldRating then
    oldRating = math.floor(tonumber(oldRating))
    local oldCount = redis.call('HINCRBY', countsKey, oldRating, -1)
    if oldCount <= 0 then
        redis.call('HDEL', countsKey, oldRating)
        redis.call('ZREM', ratingsKey, oldRating)
    end
end

-- Set new rating for user
redis.call('ZADD', usersKey, newRating, userID)

-- Update new rating count
local newCount = redis.call('HINCRBY', countsKey, newRating, 1)
if newCount == 1 then
    redis.call('ZADD', ratingsKey, newRating, newRating)
end

return 1
`

const removeUserScript = `
local usersKey = KEYS[1]
local ratingsKey = KEYS[2]
local countsKey = KEYS[3]
local userID = ARGV[1]

local rating = redis.call('ZSCORE', usersKey, userID)
if not rating then
    return 0
end

rating = math.floor(tonumber(rating))

-- Remove user
redis.call('ZREM', usersKey, userID)

-- Decrement rating count
local count = redis.call('HINCRBY', countsKey, rating, -1)
if count <= 0 then
    redis.call('HDEL', countsKey, rating)
    redis.call('ZREM', ratingsKey, rating)
end

return 1
`

type leaderboardRepository struct {
	client             *redis.Client
	updateScoreScript  *redis.Script
	removeUserScript   *redis.Script
}

func NewLeaderboardRepository(client *redis.Client) repository.LeaderboardRepository {
	return &leaderboardRepository{
		client:            client,
		updateScoreScript: redis.NewScript(updateScoreScript),
		removeUserScript:  redis.NewScript(removeUserScript),
	}
}


func (r *leaderboardRepository) UpdateScore(ctx context.Context, userID uuid.UUID, rating int) error {
	return r.updateScoreScript.Run(ctx, r.client,
		[]string{leaderboardKey, ratingsKey, ratingCountsKey},
		userID.String(), rating,
	).Err()
}


func (r *leaderboardRepository) GetRank(ctx context.Context, rating int) (int64, error) {
	count, err := r.client.ZCount(ctx, ratingsKey, strconv.Itoa(rating+1), "+inf").Result()
	if err != nil {
		return 0, err
	}
	return count + 1, nil
}

func (r *leaderboardRepository) GetTopUsers(ctx context.Context, start, stop int64) ([]repository.LeaderboardMember, error) {
	results, err := r.client.ZRevRangeWithScores(ctx, leaderboardKey, start, stop).Result()
	if err != nil {
		return nil, err
	}

	members := make([]repository.LeaderboardMember, 0, len(results))
	for _, z := range results {
		userID, err := uuid.Parse(z.Member.(string))
		if err != nil {
			continue
		}
		members = append(members, repository.LeaderboardMember{
			UserID: userID,
			Rating: int(z.Score),
		})
	}

	return members, nil
}

func (r *leaderboardRepository) GetUserScore(ctx context.Context, userID uuid.UUID) (int, error) {
	score, err := r.client.ZScore(ctx, leaderboardKey, userID.String()).Result()
	if err == redis.Nil {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return int(score), nil
}

func (r *leaderboardRepository) GetTotalCount(ctx context.Context) (int64, error) {
	return r.client.ZCard(ctx, leaderboardKey).Result()
}


func (r *leaderboardRepository) RemoveUser(ctx context.Context, userID uuid.UUID) error {
	return r.removeUserScript.Run(ctx, r.client,
		[]string{leaderboardKey, ratingsKey, ratingCountsKey},
		userID.String(),
	).Err()
}


func (r *leaderboardRepository) BulkLoad(ctx context.Context, scores map[uuid.UUID]int) error {
	if len(scores) == 0 {
		return nil
	}

	pipe := r.client.Pipeline()

	pipe.Del(ctx, leaderboardKey)
	pipe.Del(ctx, ratingsKey)
	pipe.Del(ctx, ratingCountsKey)
	ratingCounts := make(map[int]int)
	userMembers := make([]redis.Z, 0, len(scores))
	
	for userID, rating := range scores {
		userMembers = append(userMembers, redis.Z{
			Score:  float64(rating),
			Member: userID.String(),
		})
		ratingCounts[rating]++
	}


	pipe.ZAdd(ctx, leaderboardKey, userMembers...)


	ratingMembers := make([]redis.Z, 0, len(ratingCounts))
	for rating, count := range ratingCounts {
		ratingMembers = append(ratingMembers, redis.Z{
			Score:  float64(rating),
			Member: strconv.Itoa(rating),
		})
		pipe.HSet(ctx, ratingCountsKey, strconv.Itoa(rating), count)
	}
	pipe.ZAdd(ctx, ratingsKey, ratingMembers...)

	_, err := pipe.Exec(ctx)
	return err
}
