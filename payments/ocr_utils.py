import pytesseract
from PIL import Image
import re

def extract_text_from_image(image_path):
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    return text

def validate_receipt(image_path, entered_ref):
    text = extract_text_from_image(image_path)
    # basic fuzzy match: see if entered_ref substring exists in OCR text
    return entered_ref.lower() in text.lower()