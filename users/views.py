from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
class IsCaretakerOrLandlord(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in [User.Role.CARETAKER, User.Role.LANDLORD]