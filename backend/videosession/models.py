from django.db import models
from django.utils import timezone
from bookingapi.models import Booking
from advocateshub.models import User

class VideoSession(models.Model):
    # OneToOneField creates a 1:1 relationship between a Booking and a VideoSession.
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='video_session')
    
    # ManyToManyField creates a relationship where multiple users can be in one session.
    participants = models.ManyToManyField(User)
    
    # Record when the session started.
    started_at = models.DateTimeField(default=timezone.now)
    
    # Allow the end time to be null until the session ends.
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # A flag to easily check if the session is currently active.
    is_active = models.BooleanField(default=True)

    def __str__(self):
        """
        Returns a string representation of the object. This is a crucial method
        for the Django admin site and for debugging.
        """
        return f"VideoSession for Booking #{self.booking.id}"



from django.contrib.auth import get_user_model

User = get_user_model()

class ChatMessage(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    sender_id = models.CharField(max_length=100)  # From frontend `userId.current`
    sender_name = models.CharField(max_length=100, default="User")
    text = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['timestamp']  # Oldest first
        indexes = [
            models.Index(fields=['booking', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.sender_name}: {self.text[:50]}..."