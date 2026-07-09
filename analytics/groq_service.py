"""
Service module for Groq Llama 3 chat support.
Provides instant support responses for student queries.
"""
import os
from typing import Optional
from groq import Groq


def get_chat_response(user_message: str) -> Optional[str]:
    """
    Get an instant support response from Groq Llama 3 model.
    
    Args:
        user_message: The user's question or message
        
    Returns:
        The AI assistant's response text
        Returns None if request fails
    """
    try:
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            print("[Groq] Warning: GROQ_API_KEY not set in environment")
            return None
        
        client = Groq(api_key=api_key)
        
        # System prompt for support context
        system_prompt = """You are a helpful support assistant for a boarding house payment management system. 
        You help students with questions about payments, rent, maintenance requests, and general account issues.
        Keep responses concise, friendly, and actionable. Avoid technical jargon when possible."""
        
        # Create the message using chat completions API
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Updated to an active, supported fast model
            max_tokens=1024,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_message,
                }
            ],
        )
        
        # Extract and return the response
        if response.choices and len(response.choices) > 0:
            return response.choices[0].message.content
        else:
            print("[Groq] No response content from model")
            return None
            
    except Exception as e:
        print(f"[Groq] Error during chat: {e}")
        return None