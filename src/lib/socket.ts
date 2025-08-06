import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { CodeChange, ChatMessage } from '@/types/devsync';

export class DevSyncSocketServer {
  private io: SocketIOServer;
  private sessions: Map<string, Set<string>> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-session', (sessionId: string, userId: string) => {
        socket.join(sessionId);

        if (!this.sessions.has(sessionId)) {
          this.sessions.set(sessionId, new Set());
        }
        this.sessions.get(sessionId)?.add(socket.id);

        socket
          .to(sessionId)
          .emit('user-joined', { userId, socketId: socket.id });
      });

      socket.on('code-change', (data: CodeChange) => {
        socket.to(data.sessionId).emit('code-change', data);
      });

      socket.on(
        'cursor-move',
        (data: {
          sessionId: string;
          userId: string;
          position: { line: number; column: number };
        }) => {
          socket.to(data.sessionId).emit('cursor-move', data);
        }
      );

      socket.on('chat-message', (data: ChatMessage) => {
        this.io.to(data.sessionId).emit('chat-message', data);
      });

      socket.on(
        'webrtc-offer',
        (data: {
          sessionId: string;
          offer: RTCSessionDescriptionInit;
          targetId: string;
        }) => {
          socket.to(data.targetId).emit('webrtc-offer', {
            offer: data.offer,
            senderId: socket.id
          });
        }
      );

      socket.on(
        'webrtc-answer',
        (data: { answer: RTCSessionDescriptionInit; targetId: string }) => {
          socket.to(data.targetId).emit('webrtc-answer', {
            answer: data.answer,
            senderId: socket.id
          });
        }
      );

      socket.on(
        'webrtc-ice-candidate',
        (data: { candidate: RTCIceCandidateInit; targetId: string }) => {
          socket.to(data.targetId).emit('webrtc-ice-candidate', {
            candidate: data.candidate,
            senderId: socket.id
          });
        }
      );

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        this.sessions.forEach((sockets, sessionId) => {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            socket.to(sessionId).emit('user-left', { socketId: socket.id });
          }
        });
      });
    });
  }

  getIO() {
    return this.io;
  }
}
