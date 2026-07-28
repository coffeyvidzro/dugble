"""Download explicitly licensed model files and verify their immutable metadata."""

import argparse
import os
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen

from app.inference.manifest import ModelArtifact, load_model_manifest
from scripts.verify_models import DEFAULT_MANIFEST, DEFAULT_MODEL_DIR, verify_artifact


def download_artifact(artifact: ModelArtifact, model_dir: Path, *, timeout_seconds: float) -> None:
    model_dir.mkdir(parents=True, exist_ok=True)
    destination = model_dir / artifact.filename
    if verify_artifact(artifact, model_dir)["status"] == "verified":
        return

    temporary: Path | None = None
    request = Request(artifact.source_url, headers={"User-Agent": "dugble-model-fetcher/1"})
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            dir=model_dir,
            prefix=f".{artifact.filename}.",
            suffix=".partial",
            delete=False,
        ) as output:
            temporary = Path(output.name)
            response = urlopen(request, timeout=timeout_seconds)
            with response:
                if response.geturl().split(":", 1)[0].lower() != "https":
                    raise ValueError("model download redirected away from HTTPS")
                remaining = artifact.size_bytes
                while chunk := response.read(min(1024 * 1024, remaining + 1)):
                    output.write(chunk)
                    remaining -= len(chunk)
                    if remaining < 0:
                        raise ValueError(
                            f"downloaded model exceeds declared size: {artifact.logical_name}"
                        )
        assert temporary is not None
        temporary_status = verify_artifact(
            ModelArtifact(
                logical_name=artifact.logical_name,
                version=artifact.version,
                filename=temporary.name,
                sha256=artifact.sha256,
                size_bytes=artifact.size_bytes,
                source_url=artifact.source_url,
                license_name=artifact.license_name,
                license_url=artifact.license_url,
                runtime=artifact.runtime,
            ),
            temporary.parent,
        )
        if temporary_status["status"] != "verified":
            raise ValueError(
                f"downloaded model failed verification: {artifact.logical_name} "
                f"({temporary_status['status']})"
            )
        os.replace(temporary, destination)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--model-dir", type=Path, default=DEFAULT_MODEL_DIR)
    parser.add_argument("--timeout-seconds", type=float, default=60.0)
    parser.add_argument(
        "--accept-licenses",
        action="store_true",
        help="confirm that every license in the reviewed manifest has been accepted",
    )
    arguments = parser.parse_args()
    if not arguments.accept_licenses:
        parser.error("--accept-licenses is required")
    if arguments.timeout_seconds <= 0:
        parser.error("--timeout-seconds must be positive")

    manifest = load_model_manifest(arguments.manifest)
    for artifact in manifest.models:
        download_artifact(artifact, arguments.model_dir, timeout_seconds=arguments.timeout_seconds)


if __name__ == "__main__":
    main()
