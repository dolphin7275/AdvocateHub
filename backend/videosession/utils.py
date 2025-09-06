# File: videosession/utils.py

import os
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant, ChatGrant

def generate_twilio_video_token(identity: str, room_name: str) -> str:
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    api_key_sid = os.environ.get('TWILIO_API_KEY')  # Corrected key name
    api_key_secret = os.environ.get('TWILIO_API_SECRET') # Corrected key name

    if not all([account_sid, api_key_sid, api_key_secret]):
        raise ValueError("Twilio credentials are not configured properly.")

    # Create a Video grant for the specific room
    video_grant = VideoGrant(room=room_name)

    # Create an Access Token
    token = AccessToken(account_sid, api_key_sid, api_key_secret, identity=identity)
    token.add_grant(video_grant)

    return token.to_jwt()

def generate_twilio_chat_token(identity: str, chat_service_sid: str) -> str:
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    api_key_sid = os.environ.get('TWILIO_API_KEY') # Corrected key name
    api_key_secret = os.environ.get('TWILIO_API_SECRET') # Corrected key name

    if not all([account_sid, api_key_sid, api_key_secret]):
        raise ValueError("Twilio credentials are not configured properly.")

    # Create a Chat grant for the chat service
    chat_grant = ChatGrant(service_sid=chat_service_sid)

    # Create an Access Token
    token = AccessToken(account_sid, api_key_sid, api_key_secret, identity=identity)
    token.add_grant(chat_grant)
    
    return token.to_jwt()