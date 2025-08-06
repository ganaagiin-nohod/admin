'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  sessionId: string;
  userId: string;
}

export default function VideoCall({ sessionId, userId }: VideoCallProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('webrtc-offer', async ({ offer, senderId }) => {
      const peerConnection = createPeerConnection(senderId);
      await peerConnection.setRemoteDescription(offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      newSocket.emit('webrtc-answer', {
        answer,
        targetId: senderId
      });
    });

    newSocket.on('webrtc-answer', async ({ answer, senderId }) => {
      const peerConnection = peers.get(senderId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    });

    newSocket.on('webrtc-ice-candidate', async ({ candidate, senderId }) => {
      const peerConnection = peers.get(senderId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    });

    newSocket.on('user-joined', ({ socketId }) => {
      if (isCallActive && localStreamRef.current) {
        initiateCall(socketId);
      }
    });

    return () => {
      newSocket.disconnect();
      stopCall();
    };
  }, [sessionId, userId]);

  const createPeerConnection = (peerId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls:
            process.env.NEXT_PUBLIC_WEBRTC_STUN_SERVER ||
            'stun:stun.l.google.com:19302'
        }
      ]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          targetId: peerId
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const remoteVideo = document.createElement('video');
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.playsInline = true;
      remoteVideo.className = 'w-32 h-24 rounded-lg bg-gray-800';

      const container = document.getElementById('remote-videos');
      if (container) {
        container.appendChild(remoteVideo);
      }

      remoteVideosRef.current.set(peerId, remoteVideo);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    peers.set(peerId, peerConnection);
    setPeers(new Map(peers));

    return peerConnection;
  };

  const initiateCall = async (targetId: string) => {
    const peerConnection = createPeerConnection(targetId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (socket) {
      socket.emit('webrtc-offer', {
        sessionId,
        offer,
        targetId
      });
    }
  };

  const startCall = async () => {
    try {
      if (!isVideoEnabled && !isAudioEnabled) {
        setIsAudioEnabled(true);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled || (!isVideoEnabled && !isAudioEnabled)
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsCallActive(true);

      if (socket) {
        socket.emit('join-session', sessionId, userId);
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const stopCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peers.forEach((peer) => peer.close());
    setPeers(new Map());

    setIsCallActive(false);

    const container = document.getElementById('remote-videos');
    if (container) {
      container.innerHTML = '';
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  return (
    <div className='flex flex-col space-y-4'>
      <div className='flex space-x-2'>
        <Button
          onClick={isCallActive ? stopCall : startCall}
          variant={isCallActive ? 'destructive' : 'default'}
          size='sm'
        >
          {isCallActive ? (
            <PhoneOff className='h-4 w-4' />
          ) : (
            <Phone className='h-4 w-4' />
          )}
          {isCallActive ? 'End Call' : 'Start Call'}
        </Button>

        {isCallActive && (
          <>
            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? 'default' : 'secondary'}
              size='sm'
            >
              {isVideoEnabled ? (
                <Video className='h-4 w-4' />
              ) : (
                <VideoOff className='h-4 w-4' />
              )}
            </Button>

            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? 'default' : 'secondary'}
              size='sm'
            >
              {isAudioEnabled ? (
                <Mic className='h-4 w-4' />
              ) : (
                <MicOff className='h-4 w-4' />
              )}
            </Button>
          </>
        )}
      </div>

      {isCallActive && (
        <div className='flex flex-wrap gap-2'>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className='h-24 w-32 rounded-lg bg-gray-800'
          />
          <div id='remote-videos' className='flex flex-wrap gap-2' />
        </div>
      )}
    </div>
  );
}
