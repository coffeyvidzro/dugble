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

func formatMoney(micros int64) string {
	negative := micros < 0
	if negative {
		micros = -micros
	}

	whole := micros / 1_000_000
	fraction := micros % 1_000_000
	fractionText := fmt.Sprintf("%06d", fraction)
	for len(fractionText) > 2 && fractionText[len(fractionText)-1] == '0' {
		fractionText = fractionText[:len(fractionText)-1]
	}

	if negative {
		return fmt.Sprintf("-$%d.%s", whole, fractionText)
	}

	return fmt.Sprintf("$%d.%s", whole, fractionText)
}
