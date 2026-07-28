"""Benchmark deterministic image-quality analysis on synthetic images."""

import argparse
import json
from math import ceil
from statistics import mean
from time import perf_counter

from PIL import Image, ImageDraw

from app.imaging.quality import assess_image


def synthetic_capture(width: int = 1280, height: int = 800) -> Image.Image:
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    for y in range(0, height, 20):
        color = "#202020" if (y // 20) % 2 == 0 else "#b0b0b0"
        draw.rectangle((0, y, width, min(y + 9, height - 1)), fill=color)
    return image


def benchmark_quality(rounds: int) -> dict[str, object]:
    if rounds <= 0:
        raise ValueError("benchmark rounds must be positive")
    image = synthetic_capture()
    durations: list[float] = []
    for _ in range(rounds):
        started = perf_counter()
        assess_image(image)
        durations.append((perf_counter() - started) * 1000)
    ordered = sorted(durations)
    percentile_index = ceil(0.95 * len(ordered)) - 1
    return {
        "benchmark_version": "quality-synthetic-v1",
        "rounds": rounds,
        "image_width": image.width,
        "image_height": image.height,
        "mean_milliseconds": mean(durations),
        "p95_milliseconds": ordered[percentile_index],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rounds", type=int, default=20)
    arguments = parser.parse_args()
    print(json.dumps(benchmark_quality(arguments.rounds), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
