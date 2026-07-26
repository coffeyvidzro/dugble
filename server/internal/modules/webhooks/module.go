package webhooks

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

const DefaultAPIVersion = "2026-07-01"

var supportedEvents = map[string]struct{}{
	"sms.submitted": {}, "sms.sent": {}, "sms.delivered": {}, "sms.undelivered": {}, "sms.failed": {},
}

type Endpoint struct {
	ID string `json:"id"`; TeamID string `json:"team_id"`; URL string `json:"url"`; Description *string `json:"description,omitempty"`
	Enabled bool `json:"enabled"`; SubscribedEvents []string `json:"subscribed_events"`; APIVersion string `json:"api_version"`
	CreatedAt time.Time `json:"created_at"`; UpdatedAt time.Time `json:"updated_at"`; DisabledAt *time.Time `json:"disabled_at,omitempty"`
}
type EndpointWithSecret struct { Endpoint; SigningSecret string `json:"signing_secret"` }
type Event struct {
	ID string `json:"id"`; TeamID string `json:"team_id"`; Type string `json:"type"`; ObjectType string `json:"object_type"`; ObjectID *string `json:"object_id,omitempty"`
	APIVersion string `json:"api_version"`; Payload json.RawMessage `json:"payload"`; OccurredAt time.Time `json:"occurred_at"`; CreatedAt time.Time `json:"created_at"`
}
type Delivery struct {
	ID string `json:"id"`; EventID string `json:"event_id"`; EndpointID string `json:"endpoint_id"`; Status string `json:"status"`; AttemptCount int `json:"attempt_count"`
	NextAttemptAt time.Time `json:"next_attempt_at"`; LastAttemptAt *time.Time `json:"last_attempt_at,omitempty"`; ResponseStatus *int `json:"response_status,omitempty"`
	ResponseBody *string `json:"response_body,omitempty"`; LastError *string `json:"last_error,omitempty"`; DeliveredAt *time.Time `json:"delivered_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`; UpdatedAt time.Time `json:"updated_at"`
}
type CreateEndpointRequest struct { URL string `json:"url"`; Description *string `json:"description"`; SubscribedEvents []string `json:"subscribed_events"`; APIVersion string `json:"api_version"` }
type UpdateEndpointRequest struct { URL *string `json:"url"`; Description *string `json:"description"`; Enabled *bool `json:"enabled"`; SubscribedEvents *[]string `json:"subscribed_events"`; APIVersion *string `json:"api_version"` }

type Repository struct { db *pgxpool.Pool }
func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }

type Service struct { repository *Repository }
func NewService(repository *Repository) *Service { return &Service{repository: repository} }

type Handler struct { service *Service }
func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func requireTeam(ctx context.Context) (uuid.UUID, error) {
	t, ok := tenant.FromContext(ctx); if !ok { return uuid.Nil, apperrors.NewUnauthorized("Team context is required") }; return t.TeamID, nil
}
func newSecret() (string, error) { b := make([]byte, 32); if _, err := rand.Read(b); err != nil { return "", err }; return "whsec_" + base64.RawURLEncoding.EncodeToString(b), nil }
func validateEndpoint(raw string, events []string) error {
	u, err := url.ParseRequestURI(strings.TrimSpace(raw)); if err != nil || (u.Scheme != "https" && u.Scheme != "http") || u.Host == "" { return apperrors.NewBadRequest("Webhook URL must be an absolute HTTP or HTTPS URL") }
	if len(events) == 0 { return apperrors.NewBadRequest("At least one subscribed event is required") }
	for _, event := range events { if _, ok := supportedEvents[event]; !ok { return apperrors.NewBadRequest("Unsupported webhook event: " + event) } }
	return nil
}

const endpointColumns = `id, team_id, url, description, enabled, subscribed_events, api_version, created_at, updated_at, disabled_at`
func scanEndpoint(row pgx.Row) (Endpoint, error) { var e Endpoint; var id, teamID uuid.UUID; err := row.Scan(&id,&teamID,&e.URL,&e.Description,&e.Enabled,&e.SubscribedEvents,&e.APIVersion,&e.CreatedAt,&e.UpdatedAt,&e.DisabledAt); e.ID=id.String(); e.TeamID=teamID.String(); return e,err }
func scanEvent(row pgx.Row) (Event,error) { var e Event; var id,teamID uuid.UUID; var objectID *uuid.UUID; err:=row.Scan(&id,&teamID,&e.Type,&e.ObjectType,&objectID,&e.APIVersion,&e.Payload,&e.OccurredAt,&e.CreatedAt); e.ID=id.String(); e.TeamID=teamID.String(); if objectID!=nil { s:=objectID.String(); e.ObjectID=&s }; return e,err }
func scanDelivery(row pgx.Row) (Delivery,error) { var d Delivery; var id,eventID,endpointID uuid.UUID; err:=row.Scan(&id,&eventID,&endpointID,&d.Status,&d.AttemptCount,&d.NextAttemptAt,&d.LastAttemptAt,&d.ResponseStatus,&d.ResponseBody,&d.LastError,&d.DeliveredAt,&d.CreatedAt,&d.UpdatedAt); d.ID=id.String(); d.EventID=eventID.String(); d.EndpointID=endpointID.String(); return d,err }

func (s *Service) CreateEndpoint(ctx context.Context, req CreateEndpointRequest) (EndpointWithSecret,error) {
	teamID,err:=requireTeam(ctx); if err!=nil{return EndpointWithSecret{},err}; if req.APIVersion==""{req.APIVersion=DefaultAPIVersion}; if err=validateEndpoint(req.URL,req.SubscribedEvents);err!=nil{return EndpointWithSecret{},err}; secret,err:=newSecret();if err!=nil{return EndpointWithSecret{},apperrors.NewInternal("Unable to generate webhook secret",err)}
	e,err:=scanEndpoint(s.repository.db.QueryRow(ctx,`INSERT INTO webhook_endpoints(team_id,url,description,signing_secret,subscribed_events,api_version) VALUES($1,$2,$3,$4,$5,$6) RETURNING `+endpointColumns,teamID,strings.TrimSpace(req.URL),req.Description,secret,req.SubscribedEvents,req.APIVersion)); if err!=nil{return EndpointWithSecret{},apperrors.NewInternal("Unable to create webhook endpoint",err)}; return EndpointWithSecret{Endpoint:e,SigningSecret:secret},nil
}
func (s *Service) ListEndpoints(ctx context.Context)([]Endpoint,error){ teamID,err:=requireTeam(ctx);if err!=nil{return nil,err}; rows,err:=s.repository.db.Query(ctx,`SELECT `+endpointColumns+` FROM webhook_endpoints WHERE team_id=$1 ORDER BY created_at DESC`,teamID);if err!=nil{return nil,apperrors.NewInternal("Unable to list webhook endpoints",err)};defer rows.Close(); out:=[]Endpoint{};for rows.Next(){e,err:=scanEndpoint(rows);if err!=nil{return nil,apperrors.NewInternal("Unable to scan webhook endpoint",err)};out=append(out,e)};return out,rows.Err() }
func (s *Service) GetEndpoint(ctx context.Context,id string)(Endpoint,error){teamID,err:=requireTeam(ctx);if err!=nil{return Endpoint{},err};uid,err:=uuid.Parse(id);if err!=nil{return Endpoint{},apperrors.NewBadRequest("Invalid webhook endpoint id")};e,err:=scanEndpoint(s.repository.db.QueryRow(ctx,`SELECT `+endpointColumns+` FROM webhook_endpoints WHERE id=$1 AND team_id=$2`,uid,teamID));if errors.Is(err,pgx.ErrNoRows){return Endpoint{},apperrors.NewNotFound("Webhook endpoint not found")};if err!=nil{return Endpoint{},apperrors.NewInternal("Unable to get webhook endpoint",err)};return e,nil}
func (s *Service) UpdateEndpoint(ctx context.Context,id string,req UpdateEndpointRequest)(Endpoint,error){current,err:=s.GetEndpoint(ctx,id);if err!=nil{return Endpoint{},err};if req.URL!=nil{current.URL=*req.URL};if req.Description!=nil{current.Description=req.Description};if req.Enabled!=nil{current.Enabled=*req.Enabled};if req.SubscribedEvents!=nil{current.SubscribedEvents=*req.SubscribedEvents};if req.APIVersion!=nil{current.APIVersion=*req.APIVersion};if err=validateEndpoint(current.URL,current.SubscribedEvents);err!=nil{return Endpoint{},err};teamID,_:=requireTeam(ctx);uid,_:=uuid.Parse(id);e,err:=scanEndpoint(s.repository.db.QueryRow(ctx,`UPDATE webhook_endpoints SET url=$1,description=$2,enabled=$3,subscribed_events=$4,api_version=$5,disabled_at=CASE WHEN $3 THEN NULL ELSE COALESCE(disabled_at,now()) END,updated_at=now() WHERE id=$6 AND team_id=$7 RETURNING `+endpointColumns,current.URL,current.Description,current.Enabled,current.SubscribedEvents,current.APIVersion,uid,teamID));if err!=nil{return Endpoint{},apperrors.NewInternal("Unable to update webhook endpoint",err)};return e,nil}
func (s *Service) DeleteEndpoint(ctx context.Context,id string) error {teamID,err:=requireTeam(ctx);if err!=nil{return err};uid,err:=uuid.Parse(id);if err!=nil{return apperrors.NewBadRequest("Invalid webhook endpoint id")};tag,err:=s.repository.db.Exec(ctx,`DELETE FROM webhook_endpoints WHERE id=$1 AND team_id=$2`,uid,teamID);if err!=nil{return apperrors.NewInternal("Unable to delete webhook endpoint",err)};if tag.RowsAffected()==0{return apperrors.NewNotFound("Webhook endpoint not found")};return nil}
func (s *Service) RotateSecret(ctx context.Context,id string)(EndpointWithSecret,error){e,err:=s.GetEndpoint(ctx,id);if err!=nil{return EndpointWithSecret{},err};secret,err:=newSecret();if err!=nil{return EndpointWithSecret{},apperrors.NewInternal("Unable to generate webhook secret",err)};teamID,_:=requireTeam(ctx);uid,_:=uuid.Parse(id);_,err=s.repository.db.Exec(ctx,`UPDATE webhook_endpoints SET signing_secret=$1,updated_at=now() WHERE id=$2 AND team_id=$3`,secret,uid,teamID);if err!=nil{return EndpointWithSecret{},apperrors.NewInternal("Unable to rotate webhook secret",err)};return EndpointWithSecret{Endpoint:e,SigningSecret:secret},nil}
func (s *Service) TestEndpoint(ctx context.Context,id string)(Delivery,error){e,err:=s.GetEndpoint(ctx,id);if err!=nil{return Delivery{},err};teamID,_:=requireTeam(ctx);endpointID,_:=uuid.Parse(e.ID);payload:=json.RawMessage(`{"message":{"id":"test","status":"delivered"},"test":true}`);tx,err:=s.repository.db.Begin(ctx);if err!=nil{return Delivery{},apperrors.NewInternal("Unable to start webhook test",err)};defer tx.Rollback(ctx);var eventID uuid.UUID;err=tx.QueryRow(ctx,`INSERT INTO webhook_events(team_id,type,object_type,payload) VALUES($1,'sms.delivered','sms_message',$2) RETURNING id`,teamID,payload).Scan(&eventID);if err!=nil{return Delivery{},apperrors.NewInternal("Unable to create test webhook event",err)};d,err:=scanDelivery(tx.QueryRow(ctx,`INSERT INTO webhook_deliveries(event_id,endpoint_id) VALUES($1,$2) RETURNING id,event_id,endpoint_id,status,attempt_count,next_attempt_at,last_attempt_at,response_status,response_body,last_error,delivered_at,created_at,updated_at`,eventID,endpointID));if err!=nil{return Delivery{},apperrors.NewInternal("Unable to queue test webhook",err)};if err=tx.Commit(ctx);err!=nil{return Delivery{},apperrors.NewInternal("Unable to commit webhook test",err)};return d,nil}
func (s *Service) ListEvents(ctx context.Context)([]Event,error){teamID,err:=requireTeam(ctx);if err!=nil{return nil,err};rows,err:=s.repository.db.Query(ctx,`SELECT id,team_id,type,object_type,object_id,api_version,payload,occurred_at,created_at FROM webhook_events WHERE team_id=$1 ORDER BY created_at DESC LIMIT 100`,teamID);if err!=nil{return nil,apperrors.NewInternal("Unable to list webhook events",err)};defer rows.Close();out:=[]Event{};for rows.Next(){e,err:=scanEvent(rows);if err!=nil{return nil,apperrors.NewInternal("Unable to scan webhook event",err)};out=append(out,e)};return out,rows.Err()}
func (s *Service) GetEvent(ctx context.Context,id string)(Event,error){teamID,err:=requireTeam(ctx);if err!=nil{return Event{},err};uid,err:=uuid.Parse(id);if err!=nil{return Event{},apperrors.NewBadRequest("Invalid webhook event id")};e,err:=scanEvent(s.repository.db.QueryRow(ctx,`SELECT id,team_id,type,object_type,object_id,api_version,payload,occurred_at,created_at FROM webhook_events WHERE id=$1 AND team_id=$2`,uid,teamID));if errors.Is(err,pgx.ErrNoRows){return Event{},apperrors.NewNotFound("Webhook event not found")};if err!=nil{return Event{},apperrors.NewInternal("Unable to get webhook event",err)};return e,nil}
func (s *Service) GetDelivery(ctx context.Context,id string)(Delivery,error){teamID,err:=requireTeam(ctx);if err!=nil{return Delivery{},err};uid,err:=uuid.Parse(id);if err!=nil{return Delivery{},apperrors.NewBadRequest("Invalid webhook delivery id")};d,err:=scanDelivery(s.repository.db.QueryRow(ctx,`SELECT d.id,d.event_id,d.endpoint_id,d.status,d.attempt_count,d.next_attempt_at,d.last_attempt_at,d.response_status,d.response_body,d.last_error,d.delivered_at,d.created_at,d.updated_at FROM webhook_deliveries d JOIN webhook_events e ON e.id=d.event_id WHERE d.id=$1 AND e.team_id=$2`,uid,teamID));if errors.Is(err,pgx.ErrNoRows){return Delivery{},apperrors.NewNotFound("Webhook delivery not found")};if err!=nil{return Delivery{},apperrors.NewInternal("Unable to get webhook delivery",err)};return d,nil}
func (s *Service) RetryDelivery(ctx context.Context,id string)(Delivery,error){if _,err:=s.GetDelivery(ctx,id);err!=nil{return Delivery{},err};uid,_:=uuid.Parse(id);d,err:=scanDelivery(s.repository.db.QueryRow(ctx,`UPDATE webhook_deliveries SET status='pending',next_attempt_at=now(),last_error=NULL,locked_at=NULL,locked_by=NULL,updated_at=now() WHERE id=$1 RETURNING id,event_id,endpoint_id,status,attempt_count,next_attempt_at,last_attempt_at,response_status,response_body,last_error,delivered_at,created_at,updated_at`,uid));if err!=nil{return Delivery{},apperrors.NewInternal("Unable to retry webhook delivery",err)};return d,nil}

func decode(c *echo.Context,dst any) error {if err:=json.NewDecoder(c.Request().Body).Decode(dst);err!=nil{return httputil.Error(c,apperrors.NewBadRequest("Invalid JSON request body"))};return nil}
func (h *Handler) CreateEndpoint(c *echo.Context)error{var req CreateEndpointRequest;if err:=decode(c,&req);err!=nil{return err};v,err:=h.service.CreateEndpoint(c.Request().Context(),req);if err!=nil{return httputil.Error(c,err)};return httputil.Created(c,v)}
func (h *Handler) ListEndpoints(c *echo.Context)error{v,err:=h.service.ListEndpoints(c.Request().Context());if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}
func (h *Handler) GetEndpoint(c *echo.Context)error{v,err:=h.service.GetEndpoint(c.Request().Context(),c.Param("id"));if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}
func (h *Handler) UpdateEndpoint(c *echo.Context)error{var req UpdateEndpointRequest;if err:=decode(c,&req);err!=nil{return err};v,err:=h.service.UpdateEndpoint(c.Request().Context(),c.Param("id"),req);if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}
func (h *Handler) DeleteEndpoint(c *echo.Context)error{if err:=h.service.DeleteEndpoint(c.Request().Context(),c.Param("id"));err!=nil{return httputil.Error(c,err)};return c.NoContent(204)}
func (h *Handler) TestEndpoint(c *echo.Context)error{v,err:=h.service.TestEndpoint(c.Request().Context(),c.Param("id"));if err!=nil{return httputil.Error(c,err)};return httputil.Created(c,v)}
func (h *Handler) RotateSecret(c *echo.Context)error{v,err:=h.service.RotateSecret(c.Request().Context(),c.Param("id"));if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}
func (h *Handler) ListEvents(c *echo.Context)error{v,err:=h.service.ListEvents(c.Request().Context());if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}
func (h *Handler) GetEvent(c *echo.Context)error{v,err:=h.service.GetEvent(c.Request().Context(),c.Param("id"));if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}
func (h *Handler) GetDelivery(c *echo.Context)error{v,err:=h.service.GetDelivery(c.Request().Context(),c.Param("id"));if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}
func (h *Handler) RetryDelivery(c *echo.Context)error{v,err:=h.service.RetryDelivery(c.Request().Context(),c.Param("id"));if err!=nil{return httputil.Error(c,err)};return httputil.OK(c,v)}

type TenantMiddleware func(permission tenant.Permission) echo.MiddlewareFunc
func RegisterRoutes(router *echo.Echo,handler *Handler,auth echo.MiddlewareFunc,csrf echo.MiddlewareFunc,tm TenantMiddleware){
	endpoints:=router.Group("/webhook-endpoints");endpoints.Use(auth,csrf);endpoints.POST("",handler.CreateEndpoint,tm(tenant.PermissionWebhooksWrite));endpoints.GET("",handler.ListEndpoints,tm(tenant.PermissionWebhooksRead));endpoints.GET("/:id",handler.GetEndpoint,tm(tenant.PermissionWebhooksRead));endpoints.PATCH("/:id",handler.UpdateEndpoint,tm(tenant.PermissionWebhooksWrite));endpoints.DELETE("/:id",handler.DeleteEndpoint,tm(tenant.PermissionWebhooksWrite));endpoints.POST("/:id/test",handler.TestEndpoint,tm(tenant.PermissionWebhooksWrite));endpoints.POST("/:id/rotate-secret",handler.RotateSecret,tm(tenant.PermissionWebhooksWrite));
	events:=router.Group("/webhook-events");events.Use(auth,csrf);events.GET("",handler.ListEvents,tm(tenant.PermissionWebhooksRead));events.GET("/:id",handler.GetEvent,tm(tenant.PermissionWebhooksRead));deliveries:=router.Group("/webhook-deliveries");deliveries.Use(auth,csrf);deliveries.GET("/:id",handler.GetDelivery,tm(tenant.PermissionWebhooksRead));deliveries.POST("/:id/retry",handler.RetryDelivery,tm(tenant.PermissionWebhooksWrite));
}
