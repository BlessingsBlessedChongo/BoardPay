from rest_framework import serializers
from .models import MaintenanceRequest


class MaintenanceSerializer(serializers.ModelSerializer):
    created_at_relative = serializers.SerializerMethodField()
    title = serializers.CharField(source='description', read_only=True)
    
    class Meta:
        model = MaintenanceRequest
        fields = ['id', 'title', 'status', 'created_at', 'created_at_relative', 'description', 'resolved_at']
        read_only_fields = ['created_at', 'resolved_at']
    
    def get_created_at_relative(self, obj):
        """Return a human-readable relative time string."""
        from django.utils.timezone import now
        from datetime import timedelta
        
        diff = now() - obj.created_at
        
        if diff.days == 0:
            if diff.seconds < 60:
                return "just now"
            elif diff.seconds < 3600:
                mins = diff.seconds // 60
                return f"{mins}m ago"
            else:
                hours = diff.seconds // 3600
                return f"{hours}h ago"
        elif diff.days == 1:
            return "1 day ago"
        elif diff.days < 7:
            return f"{diff.days}d ago"
        else:
            weeks = diff.days // 7
            return f"{weeks}w ago" if weeks > 1 else "1w ago"
