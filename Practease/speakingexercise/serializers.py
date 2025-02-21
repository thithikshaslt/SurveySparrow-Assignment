from rest_framework import serializers
from .models import RapidFireExercise, RapidFireResponse, RapidFireAIEval

class RapidFireExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = RapidFireExercise
        fields = "__all__"

class RapidFireResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = RapidFireResponse
        fields = "__all__"

class RapidFireAIEvalSerializer(serializers.ModelSerializer):
    class Meta:
        model = RapidFireAIEval
        fields = "__all__"

        