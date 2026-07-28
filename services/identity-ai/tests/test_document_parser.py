from app.contracts.document import DocumentSide, OCRLine
from app.document.parser import GhanaCardFieldParser


def test_parser_extracts_only_explicit_labeled_front_fields():
    parser = GhanaCardFieldParser()
    lines = (
        OCRLine("Surname: Mensah", 0.94),
        OCRLine("First Name - Ama Serwaa", 0.92),
        OCRLine("Date of Birth: 01 JAN 1990", 0.88),
        OCRLine("Personal ID No: GHA-000000000-0", 0.97),
        OCRLine("Unrecognized: ignored", 0.99),
    )

    fields, missing = parser.parse(DocumentSide.FRONT, lines)

    assert tuple(field.name for field in fields) == (
        "surname",
        "given_names",
        "date_of_birth",
        "personal_id_number",
    )
    assert fields[0].normalized_value == "Mensah"
    assert missing == ()


def test_parser_preserves_missing_required_fields_as_evidence():
    fields, missing = GhanaCardFieldParser().parse(
        DocumentSide.FRONT,
        (OCRLine("Surname: Mensah", 0.9),),
    )

    assert tuple(field.name for field in fields) == ("surname",)
    assert missing == ("given_names", "date_of_birth", "personal_id_number")


def test_parser_uses_highest_confidence_duplicate_candidate():
    fields, _ = GhanaCardFieldParser().parse(
        DocumentSide.FRONT,
        (OCRLine("Surname: Wrong", 0.4), OCRLine("Surname: Mensah", 0.95)),
    )

    assert fields[0].raw_value == "Mensah"
    assert fields[0].confidence == 0.95


def test_back_side_does_not_report_front_only_fields_as_missing():
    fields, missing = GhanaCardFieldParser().parse(DocumentSide.BACK, ())

    assert fields == ()
    assert missing == ()
