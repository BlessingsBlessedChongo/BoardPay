"""
Service module for Gemini 2.5 Flash OCR receipt extraction.
Extracts amount, transaction_reference, and date from receipt images.
"""
import os
import json
import base64
from typing import Dict, Optional
import google.generativeai as genai


def extract_receipt_data(image_path: str) -> Optional[Dict]:
    """
    Extract receipt data from an image using Gemini 2.5 Flash.
    
    Args:
        image_path: Path to the receipt image file
        
    Returns:
        Dict with keys: amount, transaction_reference, date
        Returns None if extraction fails
    """
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("[Gemini] Warning: GEMINI_API_KEY not set in environment")
            return None
            
        genai.configure(api_key=api_key)
        
        # Read and encode the image
        with open(image_path, 'rb') as f:
            image_data = base64.standard_b64encode(f.read()).decode('utf-8')
        
        # Determine image media type
        ext = os.path.splitext(image_path)[1].lower()
        media_type_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        }
        media_type = media_type_map.get(ext, 'image/jpeg')
        
        # Create the model and send request
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """Analyze this receipt image and extract the following information in JSON format:
        {
            "amount": <numerical amount, e.g., 2500>,
            "transaction_reference": <reference/confirmation number as string>,
            "date": <date in YYYY-MM-DD format>
        }
        
        If any field cannot be found, use null. Return ONLY valid JSON, no other text."""
        
        response = model.generate_content([
            {
                "mime_type": media_type,
                "data": image_data,
            },
            prompt
        ])
        
        # Parse the response
        if response.text:
            try:
                extracted = json.loads(response.text)
                return {
                    'amount': extracted.get('amount'),
                    'transaction_reference': extracted.get('transaction_reference'),
                    'date': extracted.get('date'),
                }
            except json.JSONDecodeError:
                print(f"[Gemini] Failed to parse JSON response: {response.text}")
                return None
        else:
            print("[Gemini] Empty response from model")
            return None
            
    except Exception as e:
        print(f"[Gemini] Error during OCR extraction: {e}")
        return None
