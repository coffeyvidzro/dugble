package backoffice

import (
	"errors"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	backofficesmspricing "github.com/coffeyvidzro/dugble/server/internal/backoffice/smspricing"
	backofficeteams "github.com/coffeyvidzro/dugble/server/internal/backoffice/teams"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
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
	}, pricingActor(c))
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

func (h *PricingHandler) RenamePlan(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	if err := h.pricing.RenamePlan(c.Request().Context(), id, backofficesmspricing.RenamePlanRequest{
		Name: c.Request().FormValue("name"),
	}, pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) UpdatePlanStatus(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	if err := h.pricing.UpdatePlanStatus(c.Request().Context(), id, c.Request().FormValue("action"), pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) DeletePlan(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	if err := h.pricing.DeletePlan(c.Request().Context(), id, pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing")
}

func (h *PricingHandler) PreviewRate(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	preview, err := h.pricing.PreviewRate(c.Request().Context(), id, rateRequestFromForm(c))
	if err != nil {
		return handlePricingCommandError(c, err)
	}
	return h.render(c, "sms_pricing_rate_confirm.html", "Confirm SMS rate", preview)
}

func (h *PricingHandler) AddRate(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	if err := h.pricing.AddRate(c.Request().Context(), id, rateRequestFromForm(c), pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) UpdateRate(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	rateID := strings.TrimSpace(c.Param("rateID"))
	if _, err := uuid.Parse(rateID); err != nil {
		return c.String(http.StatusBadRequest, "invalid pricing rate id")
	}
	if err := h.pricing.UpdateRate(c.Request().Context(), id, rateID, backofficesmspricing.UpdateRateRequest{
		UnitCostUSD:    c.Request().FormValue("unit_cost_usd"),
		EffectiveFrom:  c.Request().FormValue("effective_from"),
		EffectiveUntil: c.Request().FormValue("effective_until"),
	}, pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) CancelRate(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	rateID := strings.TrimSpace(c.Param("rateID"))
	if _, err := uuid.Parse(rateID); err != nil {
		return c.String(http.StatusBadRequest, "invalid pricing rate id")
	}
	if err := h.pricing.CancelRate(c.Request().Context(), id, rateID, pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/sms-pricing/"+id)
}

func (h *PricingHandler) SetDefault(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid pricing plan id")
	}
	if err := h.pricing.SetDefault(c.Request().Context(), id, pricingActor(c)); err != nil {
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
		Team: team, Configuration: configuration, Plans: plans,
	})
}

func (h *PricingHandler) UpdateTeam(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid team id")
	}
	if err := h.pricing.UpdateTeam(c.Request().Context(), id, backofficesmspricing.UpdateTeamRequest{
		PricingPlanID: c.Request().FormValue("pricing_plan_id"),
	}, pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/teams/"+id+"/sms-pricing")
}

func (h *PricingHandler) ResetTeam(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid team id")
	}
	if err := h.pricing.ResetTeam(c.Request().Context(), id, pricingActor(c)); err != nil {
		return handlePricingCommandError(c, err)
	}
	return c.Redirect(http.StatusSeeOther, "/teams/"+id+"/sms-pricing")
}

func rateRequestFromForm(c *echo.Context) backofficesmspricing.AddRateRequest {
	return backofficesmspricing.AddRateRequest{
		DestinationCountry: c.Request().FormValue("destination_country"),
		UnitCostUSD:        c.Request().FormValue("unit_cost_usd"),
		EffectiveFrom:      c.Request().FormValue("effective_from"),
		EffectiveUntil:     c.Request().FormValue("effective_until"),
	}
}

func pricingActor(c *echo.Context) backofficesmspricing.Actor {
	principal, ok := authnz.PrincipalFromContext(c.Request().Context())
	if !ok {
		return backofficesmspricing.Actor{}
	}
	return backofficesmspricing.Actor{UserID: principal.UserID.String(), Email: principal.Email}
}

func handlePricingCommandError(c *echo.Context, err error) error {
	switch {
	case errors.Is(err, backofficesmspricing.ErrInvalidRequest),
		errors.Is(err, backofficesmspricing.ErrPlanUnavailable),
		errors.Is(err, backofficesmspricing.ErrNoCurrentRate),
		errors.Is(err, backofficesmspricing.ErrDefaultPlan),
		errors.Is(err, backofficesmspricing.ErrPlanInUse),
		errors.Is(err, backofficesmspricing.ErrRateImmutable):
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
	for _, prefix := range []string{backofficesmspricing.ErrInvalidRequest.Error() + ": "} {
		message = strings.TrimPrefix(message, prefix)
	}
	return message
}

func (h *PricingHandler) render(c *echo.Context, templateName string, title string, data any) error {
	token, _ := c.Get(middlewares.CSRFContextKey).(string)
	return c.Render(http.StatusOK, templateName, PageData{Title: title, Data: data, CSRF: token})
}
