const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-session', (sessionId, userId) => {
      socket.join(sessionId);
      socket.to(sessionId).emit('user-joined', { userId, socketId: socket.id });
      console.log(`User ${userId} joined session ${sessionId}`);
    });

    socket.on('code-change', (data) => {
      socket.to(data.sessionId).emit('code-change', data);
    });

    socket.on('cursor-move', (data) => {
      socket.to(data.sessionId).emit('cursor-move', data);
    });

    socket.on('chat-message', (data) => {
      io.to(data.sessionId).emit('chat-message', data);
    });

    socket.on('webrtc-offer', (data) => {
      socket.to(data.targetId).emit('webrtc-offer', {
        offer: data.offer,
        senderId: socket.id
      });
    });

    socket.on('webrtc-answer', (data) => {
      socket.to(data.targetId).emit('webrtc-answer', {
        answer: data.answer,
        senderId: socket.id
      });
    });

    socket.on('webrtc-ice-candidate', (data) => {
      socket.to(data.targetId).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        senderId: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
