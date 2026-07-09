from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from payments.views import PaymentViewSet
from maintenance.views import MaintenanceRequestViewSet
from django.conf import settings
from django.conf.urls.static import static
from users.views import MyTokenObtainPairView
from users.dashboard import StudentDashboardView, AIChatView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'payments', PaymentViewSet)
router.register(r'maintenance', MaintenanceRequestViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API routes
    path('api/', include(router.urls)),
    path('api/analytics/', include('analytics.urls')),

    # Authentication – register is now under api/auth/
    path('api/auth/', include('users.urls')),          # serves /api/auth/register/

    # Keep the token endpoints directly – they won't conflict with users.urls
    path('api/auth/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Student Dashboard & AI Chat
    path('api/student/dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('api/ai/chat/', AIChatView.as_view(), name='ai_chat'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)