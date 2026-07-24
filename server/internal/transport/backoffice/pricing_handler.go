package backoffice

import (
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"

	backofficesmspricing "github.com/coffeyvidzro/dugble/server/internal/backoffice/smspricing"
	backofficeteams "github.com/coffeyvidzro/dugble/server/internal/backoffice/teams"
	"github.com/coffeyvidzro/dugble/server/internal/transport/middlewares"
)

type PricingHandler struct {
	pricing *backofficesmspricing.Service
	teams   *backofficeteams.Service
}

type teamPricingPage struct {
	Team          backofficeteams.Detail
	Configuration backofficesmspricing.TeamConfiguration
	Plans         []backofficesmspricing.PlanOption
}

func NewPricingHandler(pricing *backofficesmspricing.Service, teams *backofficeteams.Service) *PricingHandler {
	return &PricingHandler{pricing: pricing, teams: teams}
}

func (h *PricingHandler) Plans(c *echo.Context) error {
	plans, err := h.pricing.List(c.Request().Context())
	if err != nil {
		return err
	}
	return h.render(c, "sms_pricing.html", "SMS Pricing", plans)
}

func (h *PricingHandler) CreatePlan(c *echo.Context) error {
	id, err := h.pricing.CreatePlan(c.Request().Context(), backofficesmspricing.CreatePlanRequest{
		Name: c.Request().FormValue("name"),
	})
	if err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) PlanDetail(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	detail, err := h.pricing.Detail(c.Request().Context(), id)
	if err != nil {
		return handleDetailError(c, err)
	}
	return h.render(c, "sms_pricing_detail.html", detail.Plan.Name, detail)
}

func (h *PricingHandler) AddRate(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	if err := h.pricing.AddRate(c.Request().Context(), id, backofficesmspricing.AddRateRequest{
		TrafficClass:   c.Request().FormValue("traffic_class"),
		UnitCostUSD:    c.Request().FormValue("unit_cost_usd"),
		EffectiveFrom:  c.Request().FormValue("effective_from"),
		EffectiveUntil: c.Request().FormValue("effective_until"),
	}); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) SetDefault(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	if err := h.pricing.SetDefault(c.Request().Context(), id); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) TeamConfiguration(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid team id")
	}

	team, err := h.teams.Detail(c.Request().Context(), id)
	if err != nil {
		return handleDetailError(c, err)
	}
	configuration, err := h.pricing.TeamConfiguration(c.Request().Context(), id)
	if err != nil {
		return handleDetailError(c, err)
	}
	plans, err := h.pricing.ListActivePlans(c.Request().Context())
	if err != nil {
		return err
	}

	return h.render(c, "team_sms_pricing.html", team.Team.Name+" SMS Pricing", teamPricingPage{
		Team:          team,
		Configuration: configuration,
		Plans:         plans,
	})
}

func (h *PricingHandler) UpdateTeam(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid team id")
	}

	if err := h.pricing.UpdateTeam(c.Request().Context(), id, backofficesmspricing.UpdateTeamRequest{
		PricingPlanID:       c.Request().FormValue("pricing_plan_id"),
		DefaultTrafficClass: c.Request().FormValue("default_traffic_class"),
		LocalEnabled:        c.Request().FormValue("local_enabled") != "",
		A2PEnabled:          c.Request().FormValue("a2p_enabled") != "",
	}); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/teams/"+id+"/sms-pricing")
}

func handlePricingCommandError(c *echo.Context, err error) error {
	switch {
	case errors.Is(err, backofficesmspricing.ErrInvalidRequest),
		errors.Is(err, backofficesmspricing.ErrPlanUnavailable),
		errors.Is(err, backofficesmspricing.ErrNoCurrentLocalRate),
		errors.Is(err, backofficesmspricing.ErrNoCurrentA2PRate):
		return c.String(http.StatusBadRequest, cleanPricingError(err))
	case errors.Is(err, backofficesmspricing.ErrPlanNameConflict),
		errors.Is(err, backofficesmspricing.ErrRateOverlap):
		return c.String(http.StatusConflict, cleanPricingError(err))
	default:
		return handleDetailError(c, err)
	}
}

func cleanPricingError(err error) string {
	message := err.Error()
	for _, prefix := range []string{
		backofficesmspricing.ErrInvalidRequest.Error() + ": ",
	} {
		message = strings.TrimPrefix(message, prefix)
	}
	return message
}

func (h *PricingHandler) render(c *echo.Context, templateName string, title string, data any) error {
	token, _ := c.Get(middlewares.CSRFContextKey).(string)
	return c.Render(http.StatusOK, templateName, PageData{
		Title: title,
		Data:  data,
		CSRF:  token,
	})
}
