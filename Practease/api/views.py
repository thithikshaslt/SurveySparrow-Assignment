from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def test_api(request):
    return JsonResponse({"message": "Practease API is working!"})

import openai
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage

@csrf_exempt
def transcribe_audio(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=405)
    
    if "response_audio" not in request.FILES:
        return JsonResponse({"error": "No audio file provided"}, status=400)

    audio_file = request.FILES["response_audio"]
    file_path = default_storage.save(f"temp/{audio_file.name}", audio_file)

    try:
        with open(file_path, "rb") as file:
            transcription = openai.audio.transcriptions.create(
                model="whisper-1",
                file=file
            )

        return JsonResponse({"transcription": transcription.text})  # Fixed syntax for OpenAI v1+
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    finally:
        default_storage.delete(file_path)  # Clean up the temp file
