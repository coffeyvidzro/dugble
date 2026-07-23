package backoffice

import (
	"fmt"
	"html/template"
	"io"

	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/backofficeweb"
)

type Renderer struct {
	templates *template.Template
}

func NewRenderer() (*Renderer, error) {
	tmpl, err := template.New("").
		Funcs(template.FuncMap{
			"money": formatMoney,
		}).
		ParseFS(backofficeweb.Files, "templates/*.html")
	if err != nil {
		return nil, err
	}

	return &Renderer{templates: tmpl}, nil
}

func (r *Renderer) Render(_ *echo.Context, w io.Writer, templateName string, data any) error {
	return r.templates.ExecuteTemplate(w, templateName, data)
}

func formatMoney(cents int64) string {
	negative := cents < 0
	if negative {
		cents = -cents
	}

	whole := cents / 100
	fraction := cents % 100
	if negative {
		return fmt.Sprintf("-$%d.%02d", whole, fraction)
	}

	return fmt.Sprintf("$%d.%02d", whole, fraction)
}
