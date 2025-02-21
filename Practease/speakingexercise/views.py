from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import RapidFireExercise, RapidFireResponse, RapidFireAIEval
from .serializers import RapidFireExerciseSerializer, RapidFireResponseSerializer, RapidFireAIEvalSerializer

# Create your views here.
@api_view(["GET"])
def test_endpoint(request):
    exercises = RapidFireExercise.objects.all()
    serializer = RapidFireExerciseSerializer(exercises, many=True)
    return Response({"message": "API is workingggg", "data": serializer.data})

class RapidFireExerciseViewset(viewsets.ModelViewSet):
    queryset = RapidFireExercise.objects.all()
    serializer_class = RapidFireExerciseSerializer

class RapidFireResponseViewset(viewsets.ModelViewSet):
    queryset = RapidFireResponse.objects.all()
    serializer_class = RapidFireResponseSerializer

class RapidFireAIEvalViewset(viewsets.ModelViewSet):
    queryset = RapidFireAIEval.objects.all()
    serializer_class = RapidFireAIEvalSerializer

