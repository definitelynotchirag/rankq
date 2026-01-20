package service

import (
	"context"
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/rankq/backend/internal/domain/repository"
)

type SimulationService struct {
	leaderboardRepo repository.LeaderboardRepository
	scoreRepo       repository.ScoreRepository
	running         bool
	stopCh          chan struct{}
	mu              sync.Mutex
}

func NewSimulationService(
	leaderboardRepo repository.LeaderboardRepository,
	scoreRepo repository.ScoreRepository,
) *SimulationService {
	return &SimulationService{
		leaderboardRepo: leaderboardRepo,
		scoreRepo:       scoreRepo,
	}
}

func (s *SimulationService) Start(ctx context.Context, interval time.Duration, updatesPerTick int) {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.stopCh = make(chan struct{})
	s.mu.Unlock()

	log.Printf("simulation: starting with interval=%v, updatesPerTick=%d", interval, updatesPerTick)
	go s.run(context.Background(), interval, updatesPerTick)
}

func (s *SimulationService) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.running {
		return
	}

	close(s.stopCh)
	s.running = false
}

func (s *SimulationService) IsRunning() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.running
}

func (s *SimulationService) run(ctx context.Context, interval time.Duration, updatesPerTick int) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-s.stopCh:
			return
		case <-ticker.C:
			s.performUpdates(ctx, updatesPerTick)
		}
	}
}

func (s *SimulationService) performUpdates(ctx context.Context, count int) {
	scores, err := s.scoreRepo.GetAll(ctx)
	if err != nil {
		log.Printf("simulation: failed to get scores: %v", err)
		return
	}

	if len(scores) == 0 {
		return
	}

	for i := 0; i < count && i < len(scores); i++ {
		idx := rand.Intn(len(scores))
		score := scores[idx]

		delta := rand.Intn(201) - 100
		if score.Rating > 4000 {
			delta = delta - 50
		} else if score.Rating < 500 {
			delta = delta + 50
		}
		newRating := score.Rating + delta

		if newRating < 100 {
			newRating = 100
		}
		if newRating > 5000 {
			newRating = 5000
		}


		if err := s.leaderboardRepo.UpdateScore(ctx, score.UserID, newRating); err != nil {
			log.Printf("simulation: failed to update redis: %v", err)
			continue
		}

		score.Rating = newRating
		score.UpdatedAt = time.Now()
		if err := s.scoreRepo.Upsert(ctx, score); err != nil {
			log.Printf("simulation: failed to update postgres: %v", err)
		}
	}
}
