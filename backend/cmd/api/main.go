package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rankq/backend/internal/application/service"
	"github.com/rankq/backend/internal/infrastructure/cache"
	"github.com/rankq/backend/internal/infrastructure/database"
	"github.com/rankq/backend/internal/interface/http/handler"
	"github.com/rankq/backend/internal/interface/http/router"
	"github.com/rankq/backend/pkg/config"
)

func main() {
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
	leaderboardService := service.NewLeaderboardService(userRepo, scoreRepo, leaderboardRepo)
	simulationService := service.NewSimulationService(leaderboardRepo, scoreRepo)

	userHandler := handler.NewUserHandler(userService)
	leaderboardHandler := handler.NewLeaderboardHandler(leaderboardService)
	simulationHandler := handler.NewSimulationHandler(simulationService)

	r := router.NewRouter(userHandler, leaderboardHandler, simulationHandler)
	engine := r.Setup(cfg.Server.Mode)

	srv := &http.Server{
		Addr:    ":" + cfg.Server.Port,
		Handler: engine,
	}

	go func() {
		log.Printf("server starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down server...")

	simulationService.Stop()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}

	log.Println("server exited")
}
