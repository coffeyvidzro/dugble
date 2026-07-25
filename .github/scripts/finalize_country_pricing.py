from pathlib import Path
import re


def finalize_service() -> None:
    path = Path("server/internal/modules/sms/service.go")
    text = path.read_text()
    text = text.replace(
        "txRepository.QuoteSMS(ctx, tenantContext.TeamID, normalized.TrafficClass, segments)",
        "txRepository.QuoteSMS(ctx, tenantContext.TeamID, normalized.DestinationCountry, segments)",
    )
    text = re.sub(
        r'\s*case errors\.Is\(err, ErrTrafficClassNotEnabled\):\n'
        r'\s*return Message\{\}, apperrors\.NewForbidden\('
        r'"SMS traffic class is not enabled for this team"\)\n',
        "\n",
        text,
    )
    text = text.replace(
        "SMS pricing is not configured for the requested traffic class",
        "SMS pricing is not configured for the destination country",
    )
    text = text.replace(
        "TrafficClass: quote.TrafficClass, PricingRuleID: quote.PricingRuleID,",
        "DestinationCountry: quote.DestinationCountry, PricingRuleID: quote.PricingRuleID,",
    )
    text = re.sub(
        r'^\s*req\.TrafficClass = smsapi\.NormalizeTrafficClass\(req\.TrafficClass\)\n',
        "",
        text,
        flags=re.M,
    )
    text = re.sub(
        r'\s*if req\.TrafficClass != "" && '
        r'!smsapi\.IsKnownTrafficClass\(req\.TrafficClass\) \{\n'
        r'\s*return SendRequest\{\}, apperrors\.NewBadRequest\('
        r'"SMS traffic class must be local or a2p"\)\n\s*\}\n',
        "\n",
        text,
    )

    if "ResolveDestinationCountry(req.To)" not in text:
        marker = (
            '\tif !e164Pattern.MatchString(req.To) {\n'
            '\t\treturn SendRequest{}, apperrors.NewBadRequest('
            '"SMS recipient must be a valid E.164 phone number")\n'
            '\t}\n'
        )
        insertion = marker + (
            '\tdestinationCountry, err := smsapi.ResolveDestinationCountry(req.To)\n'
            '\tif err != nil {\n'
            '\t\treturn SendRequest{}, apperrors.NewBadRequest('
            '"SMS recipient country is not supported")\n'
            '\t}\n'
            '\treq.DestinationCountry = destinationCountry\n'
        )
        if marker not in text:
            raise RuntimeError("could not find E.164 validation block")
        text = text.replace(marker, insertion, 1)

    path.write_text(text)


def finalize_worker() -> None:
    path = Path("server/internal/delivery/sms/worker.go")
    text = path.read_text().replace(
        "TrafficClass: message.TrafficClass,",
        "DestinationCountry: message.DestinationCountry,",
    )
    path.write_text(text)


def finalize_service_tests() -> None:
    path = Path("server/internal/modules/sms/service_test.go")
    text = path.read_text()
    text = text.replace('\n\t"github.com/google/uuid"\n', "\n")
    text = text.replace(
        '\n\tsmsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"\n',
        "\n",
    )
    text = re.sub(
        r'func TestValidateSendNormalizesTrafficClass\(t \*testing\.T\) \{.*?\n\}\n\n'
        r'func TestValidateSendRejectsUnknownTrafficClass\(t \*testing\.T\) \{.*?\n\}\n\n',
        '''func TestValidateSendResolvesDestinationCountry(t *testing.T) {
\treq, err := validateSend(SendRequest{To: "+233241234567", From: "DUGBLE", Body: "hello"})
\tif err != nil {
\t\tt.Fatalf("validateSend returned error: %v", err)
\t}
\tif req.DestinationCountry != "GH" {
\t\tt.Fatalf("DestinationCountry = %q, want GH", req.DestinationCountry)
\t}
}

func TestValidateSendRejectsUnsupportedDestination(t *testing.T) {
\t_, err := validateSend(SendRequest{To: "+12025550123", From: "DUGBLE", Body: "hello"})
\tif err == nil {
\t\tt.Fatal("validateSend returned nil error for unsupported destination")
\t}
}

''',
        text,
        flags=re.S,
    )
    text = re.sub(
        r'func TestResolveTrafficClassUsesTeamDefault\(t \*testing\.T\) \{.*?\n\}\n\n'
        r'func TestResolveTrafficClassRejectsDisabledClass\(t \*testing\.T\) \{.*?\n\}\n\n',
        "",
        text,
        flags=re.S,
    )
    text = text.replace(
        "TrafficClass:      smsapi.TrafficClassA2P,",
        'DestinationCountry: "GH",',
    )
    text = text.replace(
        '`"traffic_class":"a2p"`,',
        '`"destination":{"country":"GH"}`,',
    )
    path.write_text(text)


def main() -> None:
    finalize_service()
    finalize_worker()
    finalize_service_tests()
    Path("server/internal/backoffice/smspricing/rate_schedule.go").unlink(missing_ok=True)


if __name__ == "__main__":
    main()
