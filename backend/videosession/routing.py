from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/video_session/(?P<booking_id>\w+)/$', consumers.VideoSessionConsumer.as_asgi()),
]