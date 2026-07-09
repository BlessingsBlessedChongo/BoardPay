from rest_framework import serializers
from users.models import User
from properties.models import Property, Room, Lease
from payments.models import Payment
from maintenance.models import MaintenanceRequest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role')

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class LeaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lease
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('status', 'verified_by', 'blockchain_tx_hash', 'submitted_at', 'ocr_match', 'ocr_data')

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
        read_only_fields = ('reported_by', 'status', 'created_at')