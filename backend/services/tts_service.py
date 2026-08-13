import asyncio
import edge_tts
import os
import uuid

# Free Microsoft Edge TTS neural voices
# "en-US-ChristopherNeural" is a good professional male voice
# "en-US-AriaNeural" is a good professional female voice

VOICE = "en-US-ChristopherNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "audio")

os.makedirs(OUTPUT_DIR, exist_ok=True)

async def get_voices_async():
    return [
        {"ShortName": "en-US-ChristopherNeural", "FriendlyName": "US English", "Gender": "Male"},
        {"ShortName": "en-US-AriaNeural", "FriendlyName": "US English", "Gender": "Female"},
        {"ShortName": "en-GB-RyanNeural", "FriendlyName": "UK English", "Gender": "Male"},
        {"ShortName": "en-GB-SoniaNeural", "FriendlyName": "UK English", "Gender": "Female"}
    ]

def get_available_voices():
    return asyncio.run(get_voices_async())

async def generate_audio_async(text: str, filename: str, voice: str = VOICE, pitch: str = "+0Hz") -> str:
    communicate = edge_tts.Communicate(text, voice, pitch=pitch)
    output_path = os.path.join(OUTPUT_DIR, filename)
    await communicate.save(output_path)
    return output_path

def generate_audio(text: str, voice: str = VOICE, pitch: str = "+0Hz") -> str:
    """Synchronous wrapper for generating TTS audio"""
    filename = f"{uuid.uuid4()}.mp3"
    try:
        asyncio.run(generate_audio_async(text, filename, voice, pitch))
    except Exception as e:
        print(f"TTS Error: {e}")
        return None
    return f"/audio/{filename}"
