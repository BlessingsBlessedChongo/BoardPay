from django.urls import path
from .views import MyTokenObtainPairView, RegisterView

urlpatterns = [
    # You can also move the token endpoints here if you like, but they are already
    # in core/urls.py; we'll keep them there to avoid breaking. Add only register.
    path('register/', RegisterView.as_view(), name='register'),
]