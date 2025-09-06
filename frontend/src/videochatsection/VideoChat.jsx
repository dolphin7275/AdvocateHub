import React, { useState, useEffect, useRef, useCallback } from 'react';

// Helper function to generate a unique ID.
// In a production app, this would be provided by your backend after authentication.
const generateId = () => crypto.randomUUID();

// The main application component.
const App = () => {
  // === State Management ===
  const [myId] = useState(generateId());
  const [remoteId, setRemoteId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle', 'connecting', 'connected', 'disconnected'

  // === Refs for DOM elements and WebRTC objects ===
  const chatDisplayRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const websocketRef = useRef(null);
  const localStreamRef = useRef(null);

  // === Constants for the app ===
  // IMPORTANT: Replace '1' with the actual booking ID from your application.
  const BOOKING_ID = 1;
  const WEBSOCKET_URL = `ws://127.0.0.1:8000/ws/video_session/${BOOKING_ID}/`;
  const MY_NAME = 'Client'; // Placeholder for the authenticated user's name

  // WebRTC configuration using public STUN servers.
  const peerConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Helper to toggle audio and video tracks
  const toggleTrack = useCallback((type, isMuted) => {
    const stream = localStreamRef.current;
    if (stream) {
      const tracks = type === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
      tracks.forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, []);

  // Scrolls the chat messages to the bottom when new ones arrive.
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  // === Core Logic: WebRTC and WebSocket Setup ===
  const setupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      console.log("Peer connection already exists. Skipping setup.");
      return;
    }

    console.log('Setting up RTCPeerConnection...');
    const pc = new RTCPeerConnection(peerConfig);

    // Handles the discovery of ICE candidates.
    pc.onicecandidate = (event) => {
      if (event.candidate && websocketRef.current?.readyState === WebSocket.OPEN) {
        console.log('🚀 Sending ICE candidate.');
        // The backend `consumers.py` expects a payload object.
        websocketRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          payload: { candidate: event.candidate, from: myId }
        }));
      }
    };

    // Handles receiving a remote stream.
    pc.ontrack = (event) => {
      console.log('✅ Remote stream received!');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    // Logs the connection state for debugging.
    pc.oniceconnectionstatechange = () => {
      console.log('🔄 ICE connection state changed:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setConnectionStatus('disconnected');
      }
    };
    
    peerConnectionRef.current = pc;
  }, [myId]);

  // Connects to the WebSocket and handles all signaling messages.
  const setupWebSocket = useCallback(() => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket connection already open. Skipping setup.");
      return;
    }

    console.log('Setting up WebSocket connection...');
    websocketRef.current = new WebSocket(WEBSOCKET_URL);

    websocketRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connecting');
    };

    websocketRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📬 WebSocket message received:', data.type, data);

        // Access payload safely using optional chaining.
        const payload = data.payload || data;

        if (payload.type === 'offer') {
          // Received a WebRTC offer, a new call is starting.
          const offerPayload = payload.offer;
          const fromId = payload.from || 'unknown';
          setRemoteId(fromId);
          console.log(`Received offer from ${fromId}. Answering...`);

          // Ensure local stream and peer connection exist before setting remote description.
          if (!localStreamRef.current || !peerConnectionRef.current) {
            console.error('Cannot proceed, local stream or peer connection not available.');
            return;
          }

          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offerPayload));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          // Send the answer back to the other peer via WebSocket.
          websocketRef.current.send(JSON.stringify({
            type: 'answer',
            payload: { answer: answer, from: myId }
          }));

        } else if (payload.type === 'answer') {
          // Received a WebRTC answer from the other peer.
          const answerPayload = payload.answer;
          const fromId = payload.from || 'unknown';
          setRemoteId(fromId);
          console.log(`Received answer from ${fromId}. Setting remote description...`);

          if (peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answerPayload));
          }

        } else if (payload.type === 'ice_candidate') {
          // Received an ICE candidate, add it to the peer connection.
          const candidatePayload = payload.candidate;
          if (candidatePayload && peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidatePayload));
            } catch (e) {
              console.error('❌ Error adding received ICE candidate:', e);
            }
          }

        } else if (payload.type === 'chat_message') {
          // Received a chat message.
          console.log('💬 New chat message received:', payload);
          setMessages((prev) => [...prev, {
            text: payload.text,
            senderId: payload.senderId,
            senderName: payload.senderName,
            timestamp: payload.timestamp
          }]);
        }
      } catch (error) {
        console.error('❌ Error parsing or handling WebSocket message:', error);
      }
    };

    websocketRef.current.onclose = (event) => {
      console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      setConnectionStatus('disconnected');
    };

    websocketRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
  }, [myId, WEBSOCKET_URL]);

  // Function to get the local media stream (camera and mic).
  const getLocalStream = useCallback(async () => {
    try {
      console.log('Attempting to get local media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('✅ Local stream attached to video element.');
      }
      localStreamRef.current = stream;
      
      // Start muted as requested.
      toggleTrack('audio', isAudioMuted);
      toggleTrack('video', isVideoMuted);

      return stream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      return null;
    }
  }, [isAudioMuted, isVideoMuted, toggleTrack]);
  
  // Main function to start the call.
  const startCall = useCallback(async () => {
    console.log('User clicked "Start Call". Initiating WebRTC offer...');
    
    // Ensure both WebSocket and Peer Connection are set up.
    setupWebSocket();
    setupPeerConnection();
    const stream = await getLocalStream();
    if (!stream || !peerConnectionRef.current) {
      console.error('Cannot start call. Stream or peer connection not available.');
      return;
    }
    
    // Add tracks to the peer connection after stream is available.
    stream.getTracks().forEach(track => {
      console.log('➕ Adding local track to peer connection.');
      peerConnectionRef.current.addTrack(track, stream);
    });

    // Create and send the WebRTC offer.
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    
    console.log('🚀 Sending offer via WebSocket.');
    websocketRef.current.send(JSON.stringify({
      type: 'offer',
      payload: { offer: offer, from: myId }
    }));
    
  }, [getLocalStream, myId, setupPeerConnection, setupWebSocket]);

  // Effect to perform initial setup on component mount.
  useEffect(() => {
    console.log('Component mounted. Initializing connections.');

    // Cleanup function.
    return () => {
      console.log('Component unmounting. Closing connections...');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  // Handles sending a chat message.
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && websocketRef.current?.readyState === WebSocket.OPEN) {
      console.log('➡️ Sending chat message:', chatInput);
      const messageData = {
        type: 'chat_message',
        payload: {
          text: chatInput,
          senderId: myId,
          senderName: MY_NAME,
          timestamp: new Date().toISOString()
        }
      };
      
      websocketRef.current.send(JSON.stringify(messageData));
      
      // Update local state with the sent message for instant display.
      setMessages(prev => [...prev, messageData.payload]);
      setChatInput('');
    }
  };

  // Toggles audio mute state.
  const handleToggleAudio = () => {
    setIsAudioMuted(prev => {
      toggleTrack('audio', !prev);
      return !prev;
    });
  };

  // Toggles video mute state.
  const handleToggleVideo = () => {
    setIsVideoMuted(prev => {
      toggleTrack('video', !prev);
      return !prev;
    });
  };

  // Tailwind CSS classes for consistent styling.
  const buttonStyle = `py-2 px-4 rounded-full shadow-lg transition-transform duration-200 transform hover:scale-105 font-bold`;
  const mutedButtonStyle = `${buttonStyle} bg-red-600 hover:bg-red-700`;
  const unmutedButtonStyle = `${buttonStyle} bg-green-600 hover:bg-green-700`;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-800 text-white p-4 font-sans gap-4">
      {/* Video Panel */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 bg-gray-900 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Video Session</h1>
        <div className="flex-1 flex flex-col items-center w-full justify-center">
          {/* Local Video Stream */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border-2 border-gray-700">
            <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted></video>
            <div className="absolute top-2 left-2 text-xs bg-black bg-opacity-50 text-white rounded px-2 py-1">
              My Video
            </div>
          </div>

          {/* Remote Video Stream */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border-2 border-gray-700">
            <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline></video>
            <div className="absolute top-2 left-2 text-xs bg-black bg-opacity-50 text-white rounded px-2 py-1">
              Advocate's Video
            </div>
            {!remoteId && (
              <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-gray-500 bg-black bg-opacity-75">
                Waiting for remote participant...
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-4 w-full mt-4">
          <button
            onClick={startCall}
            className={`${buttonStyle} bg-blue-600 hover:bg-blue-700`}
            disabled={connectionStatus === 'connected'}
          >
            Start Call
          </button>
          <button
            onClick={handleToggleAudio}
            className={isAudioMuted ? mutedButtonStyle : unmutedButtonStyle}
          >
            {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          </button>
          <button
            onClick={handleToggleVideo}
            className={isVideoMuted ? mutedButtonStyle : unmutedButtonStyle}
          >
            {isVideoMuted ? 'Turn On Video' : 'Turn Off Video'}
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-4 text-center"> Chat</h3>
        <div 
          ref={chatDisplayRef} 
          className="flex-1 overflow-y-auto mb-4 border border-gray-700 rounded-lg p-4 space-y-3 bg-gray-800"
        >
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.senderId === myId ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                    msg.senderId === myId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {msg.senderId === myId ? 'Me' : 'Advocate'}
                  </p>
                  <p className="text-base break-words">{msg.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No messages yet. Chat messages will appear here once the call is started.</p>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-grow p-3 rounded-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className={`${buttonStyle} bg-green-600 hover:bg-green-700`}
            disabled={!chatInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
