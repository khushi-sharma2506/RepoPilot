import asyncio
import edge_tts
import os
import uuid

VOICE = "en-US-ChristopherNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
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

def get_audio_duration(filepath: str) -> float:
    """Measure the real duration of an MP3 file in seconds."""
    try:
        from mutagen.mp3 import MP3
        audio = MP3(filepath)
        return audio.info.length
    except Exception:
        pass
    # Fallback: estimate from file size (~16KB/sec for edge-tts at ~128kbps)
    try:
        size_bytes = os.path.getsize(filepath)
        return max(1.0, size_bytes / 16000)
    except Exception:
        return 8.0

async def generate_audio_async(text: str, filename: str, voice: str = VOICE, pitch: str = "+0Hz") -> str:
    communicate = edge_tts.Communicate(text, voice, pitch=pitch)
    output_path = os.path.join(OUTPUT_DIR, filename)
    await communicate.save(output_path)
    return output_path

def generate_audio(text: str, voice: str = VOICE, pitch: str = "+0Hz") -> dict:
    """Generate TTS audio and return both the URL and real duration in seconds."""
    filename = f"{uuid.uuid4()}.mp3"
    output_path = os.path.join(OUTPUT_DIR, filename)
    try:
        asyncio.run(generate_audio_async(text, filename, voice, pitch))
        duration = get_audio_duration(output_path)
    except Exception as e:
        print(f"TTS Error: {e}")
        return {"audio_url": None, "duration_seconds": 8.0}

    return {
        "audio_url": f"/audio/{filename}",
        "duration_seconds": round(duration + 0.5, 1)  # +0.5s buffer so voice never gets cut
    }
