package router

import (
	"github.com/gin-gonic/gin"
	"github.com/rankq/backend/internal/interface/http/handler"
	"github.com/rankq/backend/internal/interface/http/middleware"
)

type Router struct {
	engine             *gin.Engine
	userHandler        *handler.UserHandler
	leaderboardHandler *handler.LeaderboardHandler
	simulationHandler  *handler.SimulationHandler
}

func NewRouter(
	userHandler *handler.UserHandler,
	leaderboardHandler *handler.LeaderboardHandler,
	simulationHandler *handler.SimulationHandler,
) *Router {
	return &Router{
		userHandler:        userHandler,
		leaderboardHandler: leaderboardHandler,
		simulationHandler:  simulationHandler,
	}
}

func (r *Router) Setup(mode string) *gin.Engine {
	gin.SetMode(mode)
	r.engine = gin.New()
	r.engine.Use(gin.Recovery())
	r.engine.Use(gin.Logger())
	r.engine.Use(middleware.CORS())

	r.setupRoutes()

	return r.engine
}

func (r *Router) setupRoutes() {
	api := r.engine.Group("/api/v1")

	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	users := api.Group("/users")
	{
		users.POST("", r.userHandler.CreateUser)
		users.GET("", r.userHandler.ListUsers)
		users.GET("/:id", r.userHandler.GetUser)
	}

	leaderboard := api.Group("/leaderboard")
	{
		leaderboard.GET("", r.leaderboardHandler.GetLeaderboard)
		leaderboard.GET("/search", r.leaderboardHandler.Search)
		leaderboard.GET("/user/:id", r.leaderboardHandler.GetUserRank)
		leaderboard.PUT("/user/:id/score", r.leaderboardHandler.UpdateScore)
		leaderboard.POST("/rebuild", r.leaderboardHandler.Rebuild)
	}

	simulation := api.Group("/simulation")
	{
		simulation.POST("/start", r.simulationHandler.Start)
		simulation.POST("/stop", r.simulationHandler.Stop)
		simulation.GET("/status", r.simulationHandler.Status)
	}
}
