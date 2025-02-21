from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import test_endpoint, RapidFireAIEvalViewset, RapidFireExerciseViewset, RapidFireResponseViewset

router = DefaultRouter()
router.register(r'rapidfire-exercises', RapidFireExerciseViewset)
router.register(r'rapidfire-responses', RapidFireResponseViewset)
router.register(r'rapidfire-evaluations', RapidFireAIEvalViewset)

urlpatterns = [
    path("test/", test_endpoint, name="test_endpoint"),
    path('', include(router.urls))
]