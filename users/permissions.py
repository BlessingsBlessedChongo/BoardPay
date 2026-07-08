from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'STUDENT'

class IsCaretakerOrLandlord(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['CARETAKER', 'LANDLORD']