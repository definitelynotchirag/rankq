package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rankq/backend/internal/application/service"
)

type SimulationHandler struct {
	simulationService *service.SimulationService
}

func NewSimulationHandler(simulationService *service.SimulationService) *SimulationHandler {
	return &SimulationHandler{
		simulationService: simulationService,
	}
}

type StartSimulationRequest struct {
	IntervalMs     int `json:"interval_ms"`
	UpdatesPerTick int `json:"updates_per_tick"`
}

func (h *SimulationHandler) Start(c *gin.Context) {
	var req StartSimulationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		req.IntervalMs = 1000
		req.UpdatesPerTick = 5
	}

	if req.IntervalMs < 100 {
		req.IntervalMs = 100
	}
	if req.UpdatesPerTick < 1 {
		req.UpdatesPerTick = 1
	}
	if req.UpdatesPerTick > 100 {
		req.UpdatesPerTick = 100
	}

	h.simulationService.Start(c.Request.Context(), time.Duration(req.IntervalMs)*time.Millisecond, req.UpdatesPerTick)

	c.JSON(http.StatusOK, gin.H{
		"message":          "simulation started",
		"interval_ms":      req.IntervalMs,
		"updates_per_tick": req.UpdatesPerTick,
	})
}

func (h *SimulationHandler) Stop(c *gin.Context) {
	h.simulationService.Stop()
	c.JSON(http.StatusOK, gin.H{"message": "simulation stopped"})
}

func (h *SimulationHandler) Status(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"running": h.simulationService.IsRunning()})
}
