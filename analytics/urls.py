from django.urls import path
from .views import LandlordStatsView

urlpatterns = [
    path('landlord-stats/', LandlordStatsView.as_view(), name='landlord-stats'),
]
