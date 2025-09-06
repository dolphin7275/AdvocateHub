from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from bookingapi.models import Booking
from advocateshub.models import User
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from .utils import generate_twilio_video_token, generate_twilio_chat_token
from django.conf import settings
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import ChatMessage


# Your Twilio Chat Service SID from environment variables or Django settings
TWILIO_CHAT_SERVICE_SID = os.environ.get('TWILIO_CHAT_SERVICE_SID')

class ChatTokenCreateAPIView(APIView):
    """
    API view to get a Twilio Chat token for a given booking.
    It will automatically create a Twilio Chat Channel if one doesn't exist.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
            
            if request.user not in [booking.client.user, booking.lawyer.user]:
                return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

            account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
            auth_token = os.environ.get('TWILIO_AUTH_TOKEN')

            # Check if Twilio credentials are set, and return a server error if they aren't
            if not all([account_sid, auth_token, TWILIO_CHAT_SERVICE_SID]):
                return Response({"detail": "Twilio credentials or Chat Service SID are not configured."}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            twilio_client = Client(account_sid, auth_token)
            channel_unique_name = f"chat_{booking_id}"
            
            try:
                # Try to retrieve the channel by its unique name.
                channel = twilio_client.chat.v2.services(TWILIO_CHAT_SERVICE_SID) \
                                               .channels(channel_unique_name) \
                                               .fetch()
            except TwilioRestException as e:
                # If the channel doesn't exist, the API will return a 404 error.
                # If a different exception occurs, we'll re-raise it.
                if e.status == 404:
                    print(f"Chat channel {channel_unique_name} not found. Creating a new one...")
                    channel = twilio_client.chat.v2.services(TWILIO_CHAT_SERVICE_SID) \
                                                   .channels.create(
                                                       unique_name=channel_unique_name,
                                                       friendly_name=f"Booking {booking_id} Chat",
                                                       type='private'
                                                   )
                else:
                    raise e
            
            identity = str(request.user.id)
            token = generate_twilio_chat_token(identity, TWILIO_CHAT_SERVICE_SID)

            return Response({
                "token": token,
                "channel_sid": channel.sid,
                "booking_id": booking.id,
            })

        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)


class VideoTokenRetrieveAPIView(APIView):
    """
    API view to get a Twilio Video token for a given booking.
    It uses the booking_id as the video room name.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
            
            if request.user not in [booking.client.user, booking.lawyer.user]:
                return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

            account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
            auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
            # Check if Twilio credentials are set
            if not all([account_sid, auth_token]):
                return Response({"detail": "Twilio credentials are not configured."}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            room_name = str(booking.id)
            identity = str(request.user.id)
            
            token = generate_twilio_video_token(identity, room_name=room_name)

            return Response({
                "token": token,
                "room": room_name,
                "booking_id": booking.id
            })
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)


@csrf_exempt
@require_http_methods(["GET"])
def chat_history(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
        messages = ChatMessage.objects.filter(booking=booking).order_by('timestamp')[:100]
        
        return JsonResponse({
            'messages': [
                {
                    'text': msg.text,
                    'senderName': msg.sender_name,
                    'senderId': msg.sender_id,
                    'timestamp': msg.timestamp.isoformat(),
                }
                for msg in messages
            ]
        })
    except Booking.DoesNotExist:
        return JsonResponse({'messages': []})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)