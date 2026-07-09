"""
Student Dashboard & AI Chat views
"""
from datetime import timedelta
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, permissions

from payments.models import Payment
from maintenance.models import MaintenanceRequest
from maintenance.serializers import MaintenanceSerializer
from users.permissions import IsStudent
from analytics.groq_service import get_chat_response


class StudentDashboardView(APIView):
    """
    GET /api/student/dashboard/
    
    Returns the authenticated student's dashboard information:
    - payment_streak: consecutive months of on-time payments
    - days_remaining: days until next_due_date
    - next_due_date: calculated from lease terms
    - current_month_status: payment state machine status
    - active_maintenance: list of open/in-progress maintenance requests
    """
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        user = request.user
        
        # Get the student's active lease
        lease = user.leases.filter(is_active=True).first()
        if not lease:
            return Response(
                {"error": "No active lease found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Get payment streak
        payment_streak = user.payment_streak
        
        # Calculate next due date (end of current month or next month based on lease)
        today = now().date()
        if today.month == 12:
            next_due = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            next_due = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        
        days_remaining = max(0, (next_due - today).days)
        
        # Get current month status from latest payment
        latest_payment = lease.payments.order_by('-submitted_at').first()
        
        if latest_payment:
            if latest_payment.status == Payment.Status.VERIFIED:
                current_step = "SECURED_ON_LEDGER"
                steps_completed = ["RECEIPT_UPLOADED", "CARETAKER_REVIEW", "SECURED_ON_LEDGER"]
                steps_pending = []
            elif latest_payment.status == Payment.Status.REJECTED:
                current_step = "REJECTED"
                steps_completed = ["RECEIPT_UPLOADED"]
                steps_pending = ["CARETAKER_REVIEW", "SECURED_ON_LEDGER"]
            else:  # PENDING
                current_step = "CARETAKER_REVIEW"
                steps_completed = ["RECEIPT_UPLOADED"]
                steps_pending = ["CARETAKER_REVIEW", "SECURED_ON_LEDGER"]
            
            extracted_amount = None
            if latest_payment.ocr_data:
                extracted_amount = latest_payment.ocr_data.get('amount')
        else:
            current_step = "NO_PAYMENT"
            steps_completed = []
            steps_pending = ["RECEIPT_UPLOADED", "CARETAKER_REVIEW", "SECURED_ON_LEDGER"]
            extracted_amount = None
        
        # Get active maintenance requests for the student's room
        active_maintenance = MaintenanceRequest.objects.filter(
            room=lease.room,
            status__in=[MaintenanceRequest.Status.OPEN, MaintenanceRequest.Status.IN_PROGRESS]
        )
        
        maintenance_data = MaintenanceSerializer(active_maintenance, many=True).data
        
        # Build response
        response_data = {
            "student_name": f"{user.first_name or user.username}",
            "room_display": f"Room {lease.room.number}, {lease.room.property.name}",
            "payment_streak": payment_streak,
            "next_due_date": next_due.isoformat(),
            "days_remaining": days_remaining,
            "current_month_status": {
                "current_step": current_step,
                "steps_completed": steps_completed,
                "steps_pending": steps_pending,
                "extracted_amount": extracted_amount,
            },
            "active_maintenance": maintenance_data,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class AIChatView(APIView):
    """
    POST /api/ai/chat/
    
    Accept a message and return an instant support response using Groq Llama 3.
    Body: { "message": "..." }
    Response: { "reply": "..." }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        message = request.data.get('message', '').strip()
        
        if not message:
            return Response(
                {"error": "Message cannot be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Get response from Groq
        reply = get_chat_response(message)
        
        if reply is None:
            return Response(
                {"error": "Failed to get response from AI service"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        
        return Response(
            {"reply": reply},
            status=status.HTTP_200_OK,
        )
