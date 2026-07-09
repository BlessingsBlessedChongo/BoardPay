from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from payments.models import Payment
from properties.models import Room


class LandlordStatsView(APIView):
    """
    GET /api/analytics/landlord-stats/

    Aggregated dashboard stats for the logged-in landlord:
      - monthly_revenue: verified payment totals, grouped by month
      - occupancy: how many of the landlord's rooms are occupied vs vacant
      - pending_count: payments awaiting caretaker verification
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'LANDLORD':
            return Response(
                {"error": "Only landlords can view this dashboard."},
                status=status.HTTP_403_FORBIDDEN,
            )

        landlord = request.user

        # --- Monthly revenue (verified payments only) ---------------------
        monthly_qs = (
            Payment.objects.filter(
                status=Payment.Status.VERIFIED,
                lease__room__property__landlord=landlord,
            )
            .annotate(month=TruncMonth('submitted_at'))
            .values('month')
            .annotate(revenue=Sum('amount'))
            .order_by('month')
        )
        monthly_revenue = [
            {
                "month": entry["month"].strftime("%b %Y"),
                "revenue": float(entry["revenue"] or 0),
            }
            for entry in monthly_qs
        ]

        # --- Occupancy ------------------------------------------------------
        landlord_rooms = Room.objects.filter(property__landlord=landlord)
        total_rooms = landlord_rooms.count()
        occupied_rooms = landlord_rooms.filter(leases__is_active=True).distinct().count()
        occupancy = {
            "occupied": occupied_rooms,
            "vacant": total_rooms - occupied_rooms,
        }

        # --- Pending payments count ------------------------------------------
        pending_count = Payment.objects.filter(
            status=Payment.Status.PENDING,
            lease__room__property__landlord=landlord,
        ).count()

        return Response(
            {
                "monthly_revenue": monthly_revenue,
                "occupancy": occupancy,
                "pending_count": pending_count,
            }
        )
