from io import BytesIO

from PIL import Image

from app.contracts.quality import QualityResult
from app.imaging import decode_image
from app.imaging.quality import assess_image
from app.quality import assess_image as compatibility_assess_image


def test_imaging_package_exports_bounded_decoder():
    encoded = BytesIO()
    Image.new("RGB", (16, 12), "navy").save(encoded, format="PNG")

    decoded = decode_image(encoded.getvalue())

    assert decoded.mode == "RGB"
    assert decoded.size == (16, 12)


def test_quality_contract_is_shared_by_new_and_compatibility_imports():
    image = Image.new("RGB", (640, 400), "gray")

    result = assess_image(image)
    compatibility_result = compatibility_assess_image(image)

    assert isinstance(result, QualityResult)
    assert compatibility_result == result
