export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: {
    line: number;
    column: number;
  };
}

export interface CollaborationSession {
  chatHistory: any;
  _id?: string;
  id?: string;
  name: string;
  createdBy: string;
  participants: User[];
  code: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeChange {
  sessionId: string;
  userId: string;
  type: 'insert' | 'delete' | 'replace';
  position: {
    line: number;
    column: number;
  };
  content: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'ai';
}

export interface WebRTCPeer {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}
