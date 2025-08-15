from openai import OpenAI
import os
from typing import Optional, Dict, Any, List
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_models import AIPersona

# Learn more about calling the LLM: https://the-pocket.github.io/PocketFlow/utility_function/llm.html

def call_llm(prompt: str, system_prompt: Optional[str] = None, model: str = "gpt-4o", 
             temperature: float = 0.7, max_tokens: Optional[int] = None) -> str:
    """
    Basic LLM call with optional system prompt customization.
    
    Args:
        prompt: The user prompt to send to the LLM
        system_prompt: Optional system prompt to set context/behavior
        model: OpenAI model to use (default: gpt-4o)
        temperature: Creativity level (0.0-1.0)
        max_tokens: Maximum tokens in response
    
    Returns:
        The LLM's response as a string
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "your-api-key"))
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    kwargs = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }
    
    if max_tokens:
        kwargs["max_tokens"] = max_tokens
    
    r = client.chat.completions.create(**kwargs)
    return r.choices[0].message.content

def call_llm_with_persona(prompt: str, persona: AIPersona, context: Optional[str] = None,
                         model: str = "gpt-4o", temperature: Optional[float] = None) -> str:
    """
    LLM call using a specific AI persona configuration.
    
    Args:
        prompt: The user prompt to send to the LLM
        persona: AIPersona object containing system prompt and preferences
        context: Optional additional context to include
        model: OpenAI model to use (default: gpt-4o)
        temperature: Override persona's temperature preference
    
    Returns:
        The LLM's response as a string
    """
    # Build the system prompt from persona
    system_prompt = persona.system_prompt
    
    # Add custom instructions if available
    if persona.custom_instructions:
        system_prompt += f"\n\nAdditional Instructions: {persona.custom_instructions}"
    
    # Add specialization context
    if persona.specialization:
        system_prompt += f"\n\nYou are specialized in: {persona.specialization}"
    
    # Add style preferences
    if persona.style_preferences:
        style_notes = []
        for key, value in persona.style_preferences.items():
            style_notes.append(f"{key}: {value}")
        if style_notes:
            system_prompt += f"\n\nStyle preferences: {', '.join(style_notes)}"
    
    # Add context if provided
    if context:
        system_prompt += f"\n\nCurrent context: {context}"
    
    # Use persona's preferred temperature or provided override
    if temperature is None:
        temperature = float(persona.style_preferences.get("temperature", "0.7"))
    
    return call_llm(prompt, system_prompt, model, temperature)

def call_llm_for_writing_assistance(prompt: str, writing_context: Dict[str, Any], 
                                  persona: AIPersona) -> str:
    """
    Specialized LLM call for writing assistance with rich context.
    
    Args:
        prompt: The writing assistance request
        writing_context: Dictionary containing story context, characters, etc.
        persona: AI persona to use for the assistance
    
    Returns:
        The LLM's writing assistance response
    """
    # Build context string from writing context
    context_parts = []
    
    if writing_context.get("current_characters"):
        context_parts.append(f"Active characters: {', '.join(writing_context['current_characters'])}")
    
    if writing_context.get("current_location"):
        context_parts.append(f"Current location: {writing_context['current_location']}")
    
    if writing_context.get("scene_mood"):
        context_parts.append(f"Scene mood: {writing_context['scene_mood']}")
    
    if writing_context.get("story_position"):
        context_parts.append(f"Story position: {writing_context['story_position']}")
    
    context_string = "\n".join(context_parts) if context_parts else None
    
    return call_llm_with_persona(prompt, persona, context_string)

def get_available_models() -> List[str]:
    """
    Get list of available OpenAI models for the current API key.
    
    Returns:
        List of available model names
    """
    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "your-api-key"))
        models = client.models.list()
        return [model.id for model in models.data if "gpt" in model.id]
    except Exception as e:
        print(f"Error fetching models: {e}")
        return ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]  # Fallback list

def test_llm_connection() -> bool:
    """
    Test the LLM connection and API key validity.
    
    Returns:
        True if connection is successful, False otherwise
    """
    try:
        response = call_llm("Hello, please respond with 'Connection successful'")
        return "successful" in response.lower()
    except Exception as e:
        print(f"LLM connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing LLM utilities...")
    print("=" * 50)
    
    # Test 1: Basic LLM call
    print("Test 1: Basic LLM call")
    try:
        response = call_llm("What is the meaning of life?")
        print(f"Response: {response[:100]}...")
        print("✓ Basic call successful")
    except Exception as e:
        print(f"✗ Basic call failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 2: LLM call with system prompt
    print("Test 2: LLM call with system prompt")
    try:
        system_prompt = "You are a helpful writing assistant. Respond in a creative, encouraging tone."
        response = call_llm("Give me a writing tip", system_prompt=system_prompt)
        print(f"Response: {response[:100]}...")
        print("✓ System prompt call successful")
    except Exception as e:
        print(f"✗ System prompt call failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 3: Persona-based call
    print("Test 3: Persona-based LLM call")
    try:
        # Create a test persona
        test_persona = AIPersona(
            name="Dialogue Coach",
            specialization="character_dialogue",
            system_prompt="You are an expert dialogue coach for novelists. Help writers create authentic, engaging character conversations.",
            style_preferences={"tone": "encouraging", "temperature": "0.8"},
            active_capabilities=["dialogue_generation", "character_voice"]
        )
        
        response = call_llm_with_persona(
            "Help me write dialogue for a nervous character meeting their hero",
            test_persona
        )
        print(f"Response: {response[:100]}...")
        print("✓ Persona call successful")
    except Exception as e:
        print(f"✗ Persona call failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 4: Connection test
    print("Test 4: Connection test")
    if test_llm_connection():
        print("✓ LLM connection test passed")
    else:
        print("✗ LLM connection test failed")
    
    print("\n" + "=" * 50)
    
    # Test 5: Available models
    print("Test 5: Available models")
    try:
        models = get_available_models()
        print(f"Available models: {models[:3]}...")  # Show first 3
        print("✓ Model listing successful")
    except Exception as e:
        print(f"✗ Model listing failed: {e}")
    
    print("\nAll tests completed!")
