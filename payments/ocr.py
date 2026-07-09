"""
OCR verification for uploaded payment receipts.

Uses pytesseract (which wraps the Tesseract OCR engine) to read text off a
receipt image and check whether the student-entered transaction reference
appears in it. Tesseract must be installed separately on the host machine
(it is a system binary, not just a pip package) - see SETUP.md.
"""


def check_reference(image_path, entered_ref):
    """
    Return True if `entered_ref` is found (case-insensitively) in the OCR'd
    text of the receipt image at `image_path`.

    If Tesseract/pytesseract isn't available or isn't installed on the host
    (ImportError / OSError), we default to True so that a missing OCR
    dependency never blocks the payment-submission flow. In that case
    caretakers will simply do the visual verification manually.
    """
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        return True

    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
    except OSError:
        # Covers both a bad/corrupt image file and Tesseract binary not
        # being installed on the host (pytesseract raises TesseractNotFoundError,
        # which is a subclass of OSError/EnvironmentError).
        return True

    return entered_ref.lower() in text.lower()
