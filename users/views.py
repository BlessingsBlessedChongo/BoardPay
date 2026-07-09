from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .serializers import MyTokenObtainPairSerializer

User = get_user_model()


class MyTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns a JWT pair whose access token includes `role`."""
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Body: { username, email, password }
    Creates a new user with role STUDENT and returns 201.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        errors = {}

        username = str(data.get('username', '')).strip()
        email = str(data.get('email', '')).strip().lower()
        password = str(data.get('password', ''))

        # Validate username
        if not username:
            errors['username'] = 'Username is required.'
        elif User.objects.filter(username=username).exists():
            errors['username'] = 'This username is already taken.'
        elif len(username) < 3:
            errors['username'] = 'Username must be at least 3 characters.'

        # Validate email
        if not email:
            errors['email'] = 'Email is required.'
        else:
            try:
                validate_email(email)
            except ValidationError:
                errors['email'] = 'Enter a valid email address.'
            else:
                if User.objects.filter(email=email).exists():
                    errors['email'] = 'An account with this email already exists.'

        # Validate password
        if not password:
            errors['password'] = 'Password is required.'
        elif len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters.'

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        # Set role to STUDENT (your model already defaults to STUDENT, but explicit is fine)
        if hasattr(user, 'role'):
            user.role = 'STUDENT'
            user.save(update_fields=['role'])

        return Response(
            {'detail': 'Account created successfully. You can now sign in.'},
            status=status.HTTP_201_CREATED,
        )