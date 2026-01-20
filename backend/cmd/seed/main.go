package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/rankq/backend/internal/application/service"
	"github.com/rankq/backend/internal/infrastructure/cache"
	"github.com/rankq/backend/internal/infrastructure/database"
	"github.com/rankq/backend/pkg/config"
)

var adjectives = []string{
	"Swift", "Brave", "Clever", "Dark", "Epic", "Fast", "Great", "Happy",
	"Iron", "Jade", "Keen", "Lucky", "Mega", "Noble", "Prime", "Quick",
	"Royal", "Storm", "True", "Ultra", "Vivid", "Wild", "Xeno", "Zesty",
	"Crimson", "Azure", "Golden", "Silver", "Neon", "Cyber", "Pixel", "Quantum",
}

var nouns = []string{
	"Phoenix", "Dragon", "Tiger", "Eagle", "Wolf", "Hawk", "Lion", "Bear",
	"Shark", "Viper", "Raven", "Falcon", "Panther", "Cobra", "Ninja", "Knight",
	"Wizard", "Hunter", "Ranger", "Shadow", "Thunder", "Blaze", "Frost", "Storm",
	"Coder", "Hacker", "Runner", "Walker", "Pilot", "Driver", "Rider", "Gamer",
}

func main() {
	numUsers := flag.Int("n", 100, "number of users to seed")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer db.Close()

	redisClient, err := cache.NewRedisClient(cfg.Redis)
	if err != nil {
		log.Fatalf("failed to connect to redis: %v", err)
	}
	defer redisClient.Close()

	userRepo := database.NewUserRepository(db)
	scoreRepo := database.NewScoreRepository(db)
	leaderboardRepo := cache.NewLeaderboardRepository(redisClient)

	userService := service.NewUserService(userRepo, scoreRepo, leaderboardRepo)

	ctx := context.Background()

	log.Printf("seeding %d users...", *numUsers)

	for i := 0; i < *numUsers; i++ {
		username := generateUsername(i)
		rating := 100 + rand.Intn(4901)

		_, err := userService.CreateUser(ctx, username, rating)
		if err != nil {
			// Don't fail completely on duplicates, just log and continue
			log.Printf("failed to create user %s: %v", username, err)
			continue
		}

		if (i+1)%100 == 0 {
			log.Printf("created %d/%d users", i+1, *numUsers)
		}
	}

	log.Println("seeding complete!")
}

func generateUsername(index int) string {
	adj := adjectives[rand.Intn(len(adjectives))]
	noun := nouns[rand.Intn(len(nouns))]
	// Use a wider range for random number to avoid collisions given 10k users
	num := rand.Intn(100000)
	// Add index to ensure uniqueness if needed, or rely on random.
	// To be safer with 10k, let's append a random suffix or ensuring high entropy.
	// Mixing in index helps avoid collisions in a single run.
	return fmt.Sprintf("%s%s%d_%d", adj, noun, num, index)
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
