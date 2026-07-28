"""Safe image decoding helpers for identity analysis pipelines."""

from __future__ import annotations

from io import BytesIO
from os import PathLike
from pathlib import Path
from typing import BinaryIO

from PIL import Image, ImageOps, UnidentifiedImageError

DEFAULT_MAX_INPUT_BYTES = 15 * 1024 * 1024
DEFAULT_MAX_PIXELS = 20_000_000


type ImageSource = str | PathLike[str] | bytes | bytearray | memoryview | BinaryIO


class ImageDecodeError(ValueError):
    """Raised when input cannot be safely decoded as an image."""


class ImageSizeError(ImageDecodeError):
    """Raised when encoded or decoded image size exceeds configured limits."""


def _read_source(source: ImageSource, max_input_bytes: int) -> bytes:
    if max_input_bytes <= 0:
        raise ValueError("max_input_bytes must be positive")

    if isinstance(source, (bytes, bytearray, memoryview)):
        data = bytes(source)
    elif isinstance(source, (str, PathLike)):
        path = Path(source)
        try:
            if path.stat().st_size > max_input_bytes:
                raise ImageSizeError("encoded image exceeds the size limit")
            data = path.read_bytes()
        except ImageSizeError:
            raise
        except OSError as error:
            raise ImageDecodeError("image could not be read") from error
    elif hasattr(source, "read"):
        try:
            data = source.read(max_input_bytes + 1)
        except OSError as error:
            raise ImageDecodeError("image could not be read") from error
        if not isinstance(data, bytes):
            raise ImageDecodeError("image stream must return bytes")
    else:
        raise TypeError("unsupported image source")

    if len(data) > max_input_bytes:
        raise ImageSizeError("encoded image exceeds the size limit")
    if not data:
        raise ImageDecodeError("image is empty")
    return data


def normalize_image(image: Image.Image, *, max_pixels: int = DEFAULT_MAX_PIXELS) -> Image.Image:
    """Apply EXIF orientation, enforce pixel limits, and return an RGB copy."""

    if max_pixels <= 0:
        raise ValueError("max_pixels must be positive")
    width, height = image.size
    if width * height > max_pixels:
        raise ImageSizeError("decoded image exceeds the pixel limit")

    try:
        normalized = ImageOps.exif_transpose(image)
        normalized.load()
        return normalized.convert("RGB")
    except (Image.DecompressionBombError, OSError) as error:
        raise ImageDecodeError("image could not be decoded") from error


def decode_image(
    source: ImageSource,
    *,
    max_input_bytes: int = DEFAULT_MAX_INPUT_BYTES,
    max_pixels: int = DEFAULT_MAX_PIXELS,
) -> Image.Image:
    """Decode a bounded byte, stream, or filesystem image source."""

    data = _read_source(source, max_input_bytes)
    try:
        with Image.open(BytesIO(data)) as image:
            return normalize_image(image, max_pixels=max_pixels)
    except ImageDecodeError:
        raise
    except (Image.DecompressionBombError, OSError, UnidentifiedImageError) as error:
        raise ImageDecodeError("image could not be decoded") from error
