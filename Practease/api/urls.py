from django.urls import path, include
from .views import test_api, transcribe_audio

urlpatterns = [
    path('test/', test_api, name="test_api"),
    path('speakingexercise/', include('speakingexercise.urls')),
    path("transcribe-audio/", transcribe_audio, name="transcribe-audio"),


]