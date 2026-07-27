# Synthetic quality fixtures

This directory contains a manifest for fictional, procedurally rendered
document captures used by deterministic quality regression tests. It contains
no binary images, does not depict a real Ghana Card or person, and all rendered
values are explicit synthetic placeholders.

`manifest.json` labels each fixture with its document side, intended
degradation, and expected quality-core output. The evaluator renders fixtures
in memory. To inspect optional local PNG previews, export them to the ignored
`generated` directory from the service root:

```sh
python -m evaluation.synthetic_quality \
  --output-dir tests/fixtures/quality/generated
```

Run the offline evaluation and optionally save its JSON report:

```sh
python -m evaluation.quality
python -m evaluation.quality --output /tmp/quality-report.json
```

The tool exits nonzero when an accept/reject expectation or exact reason list
does not match. These fixtures are regression coverage, not evidence that the
provisional thresholds are calibrated for Ghanaian production captures.
