import json

import pytest

from evaluation.common import read_json_lines, write_report


def test_json_lines_reader_accepts_bounded_object_records(tmp_path):
    input_path = tmp_path / "samples.jsonl"
    input_path.write_text('{"sample_id":"one"}\n\n{"sample_id":"two"}\n', encoding="utf-8")

    records = read_json_lines(input_path)

    assert records == ({"sample_id": "one"}, {"sample_id": "two"})


def test_json_lines_reader_rejects_excess_samples(tmp_path):
    input_path = tmp_path / "samples.jsonl"
    input_path.write_text("{}\n{}\n", encoding="utf-8")

    with pytest.raises(ValueError, match="sample limit"):
        read_json_lines(input_path, max_samples=1)


def test_report_writer_creates_machine_readable_output(tmp_path):
    output = tmp_path / "reports" / "report.json"

    write_report({"metric": 1}, output)

    assert json.loads(output.read_text(encoding="utf-8")) == {"metric": 1}
