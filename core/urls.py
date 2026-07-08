from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from payments.views import PaymentViewSet
from django.conf import settings
from django.conf.urls.static import static
from users.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
router = DefaultRouter()
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)