from django.urls import path, include
from .views import test_api

urlpatterns = [
    path('test/', test_api, name="test_api"),
    path('speakingexercise/', include('speakingexercise.urls'))

]