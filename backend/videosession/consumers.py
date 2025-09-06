# videosession/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ✅ Custom JSON serializer for datetime
def json_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

class VideoSessionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.room_group_name = f'video_chat_{self.booking_id}'
        self.user = self.scope.get('user', 'AnonymousUser')

        logger.info(f"🔌 [Connect] User: {self.user}, Booking ID: {self.booking_id}")
        logger.info(f"🏷️  Room Group: {self.room_group_name}")

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"✅ [Connected] WebSocket accepted for booking {self.booking_id}")

        # ✅ Load and send past messages
        try:
            past_messages = await self.get_past_messages(self.booking_id)
            for msg in past_messages:
                # ✅ Convert timestamp to string
                msg['timestamp'] = msg['timestamp'].isoformat() if msg['timestamp'] else None
                # ✅ Use custom serializer
                await self.send(text_data=json.dumps({
                    'type': 'chat_message',
                    'payload': msg
                }, default=json_serializer))
            logger.info(f"📩 [History] Sent {len(past_messages)} past messages")
        except Exception as e:
            logger.error(f"❌ [History] Failed to load messages: {e}", exc_info=True)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"🔌 [Disconnected] Booking: {self.booking_id}, Code: {close_code}, Channel: {self.channel_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            payload = data.get('payload', {})

            sender_id = payload.get('senderId', 'unknown')
            logger.info(f"📨 [Receive] Type: {message_type} | From: {sender_id} | Booking: {self.booking_id}")

            if message_type == 'chat_message':
                await self.save_message(
                    booking_id=self.booking_id,
                    sender_id=payload['senderId'],
                    sender_name=payload.get('senderName', 'Unknown'),
                    text=payload['text']
                )

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': message_type,
                    'message': payload
                }
            )
        except Exception as e:
            logger.error(f"❌ [Receive] Unexpected error: {type(e).__name__}: {e}", exc_info=True)

    # === Message Handlers ===
    async def offer(self, event):
        await self.send(text_data=json.dumps({'type': 'offer', 'payload': event['message']}, default=json_serializer))

    async def answer(self, event):
        await self.send(text_data=json.dumps({'type': 'answer', 'payload': event['message']}, default=json_serializer))

    async def ice_candidate(self, event):
        await self.send(text_data=json.dumps({'type': 'ice_candidate', 'payload': event['message']}, default=json_serializer))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'chat_message', 'payload': event['message']}, default=json_serializer))

    # === Database Methods ===
    @database_sync_to_async
    def save_message(self, booking_id, sender_id, sender_name, text):
        from .models import ChatMessage
        from bookingapi.models import Booking
        try:
            booking = Booking.objects.get(id=booking_id)
            ChatMessage.objects.create(
                booking=booking,
                sender_id=sender_id,
                sender_name=sender_name,
                text=text
            )
        except Exception as e:
            logger.error(f"❌ [Save] Failed to save message: {e}", exc_info=True)

    @database_sync_to_async
    def get_past_messages(self, booking_id):
        from .models import ChatMessage
        from bookingapi.models import Booking
        try:
            booking = Booking.objects.get(id=booking_id)
            return list(
                ChatMessage.objects
                .filter(booking=booking)
                .values('text', 'sender_id', 'sender_name', 'timestamp')
                .order_by('timestamp')[:100]
            )
        except Booking.DoesNotExist:
            logger.warning(f"⚠️ [Load] Booking {booking_id} not found")
            return []
        except Exception as e:
            logger.error(f"❌ [Load] Failed to fetch messages: {e}", exc_info=True)
            return []