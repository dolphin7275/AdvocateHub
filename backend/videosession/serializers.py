from rest_framework import serializers
from userapi.models import VideoSession
from advocateshub.models import User

class VideoSessionSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True
    )

    class Meta:
        model = VideoSession
        fields = ['id', 'booking', 'participants', 'started_at', 'ended_at', 'is_active']

    def create(self, validated_data):
        participants = validated_data.pop('participants')
        video_session = VideoSession.objects.create(**validated_data)
        video_session.participants.set(participants)
        return video_session
