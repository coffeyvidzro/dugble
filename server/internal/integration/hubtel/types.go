package hubtel

type InitiateCheckoutRequest struct {
	TotalAmount           int64  `json:"totalAmount"`
	Description           string `json:"description"`
	CallbackURL           string `json:"callbackUrl"`
	ReturnURL             string `json:"returnUrl"`
	MerchantAccountNumber string `json:"merchantAccountNumber"`
	CancellationURL       string `json:"cancellationUrl"`
	ClientReference       string `json:"clientReference"`
}

type InitiateCheckoutResponse struct {
	ResponseCode string       `json:"responseCode"`
	Status       string       `json:"status"`
	Data         CheckoutData `json:"data"`
}

type CheckoutData struct {
	CheckoutURL       string `json:"checkoutUrl"`
	CheckoutID        string `json:"checkoutId"`
	ClientReference   string `json:"clientReference"`
	Message           string `json:"message"`
	CheckoutDirectURL string `json:"checkoutDirectUrl"`
}
