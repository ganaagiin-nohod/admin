'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types/devsync';

interface SessionChatProps {
  sessionId: string;
  userId: string;
  userName: string;
  initialMessages?: ChatMessage[];
}

export default function SessionChat({
  sessionId,
  userId,
  userName,
  initialMessages = []
}: SessionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join-session', sessionId, userId);

    newSocket.on('chat-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sessionId,
      userId,
      userName,
      message: newMessage,
      timestamp: new Date(),
      type: 'user'
    };

    socket.emit('chat-message', message);

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatMessage: {
            userName,
            message: newMessage,
            type: 'user'
          }
        })
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader>
        <CardTitle className='text-lg'>Session Chat</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col'>
        <div className='mb-4 flex-1 space-y-3 overflow-y-auto'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.userId === userId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-[80%] items-start gap-2 ${
                  message.userId === userId ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className='flex-shrink-0'>
                  {message.type === 'ai' ? (
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-500'>
                      <Bot className='h-4 w-4 text-white' />
                    </div>
                  ) : (
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500'>
                      <User className='h-4 w-4 text-white' />
                    </div>
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.userId === userId
                      ? 'bg-blue-500 text-white'
                      : message.type === 'ai'
                        ? 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
                        : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <div className='mb-1 text-sm font-medium'>
                    {message.type === 'ai' ? 'AI Assistant' : message.userName}
                  </div>
                  <div className='text-sm whitespace-pre-wrap'>
                    {message.message}
                  </div>
                  <div className='mt-1 text-xs opacity-70'>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className='flex gap-2'>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Type a message...'
            className='flex-1'
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
