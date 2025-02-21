from django.contrib import admin
from .models import RapidFireExercise, RapidFireResponse, RapidFireAIEval

# Register your models here.
admin.site.register(RapidFireExercise)
admin.site.register(RapidFireResponse)
admin.site.register(RapidFireAIEval)

