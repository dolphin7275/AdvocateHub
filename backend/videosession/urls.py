# advocatehub/backend/videosession/urls.py

from django.urls import path
from .views import VideoTokenRetrieveAPIView, ChatTokenCreateAPIView ,chat_history

# This is the correct configuration to expose your API views.
urlpatterns = [
    # The URL paths are relative to the 'videosession/' prefix from the main urls.py
    path('video_token/<int:booking_id>/', VideoTokenRetrieveAPIView.as_view(), name='video_token_retrieve'),
    path('chat_token/<int:booking_id>/', ChatTokenCreateAPIView.as_view(), name='chat_token_create'),
    path('api/video_session/<int:booking_id>/history/', chat_history, name='chat_history'),
]

# backend/videosession/urls.py
from django.urls import path, re_path
from . import consumers

# WebSocket
websocket_urlpatterns = [
    re_path(r'ws/video_session/(?P<booking_id>\w+)/$', consumers.VideoSessionConsumer.as_asgi()),
]
