'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Code, Bug, Lightbulb, MessageSquare } from 'lucide-react';

interface AIAssistantProps {
  sessionId: string;
  selectedCode?: string;
  onResponse?: (response: string) => void;
}

export default function AIAssistant({
  sessionId,
  selectedCode,
  onResponse
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleAIRequest = async (action: string, customPrompt?: string) => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/ai-assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: customPrompt || prompt,
          selectedCode: selectedCode || '',
          action
        })
      });

      const data = await res.json();

      if (data.response) {
        setResponse(data.response);
        onResponse?.(data.response);
      }
    } catch (error) {
      console.error('AI request failed:', error);
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <MessageSquare className='h-4 w-4' />,
      label: 'Explain',
      action: 'explain',
      disabled: !selectedCode
    },
    {
      icon: <Code className='h-4 w-4' />,
      label: 'Refactor',
      action: 'refactor',
      disabled: !selectedCode
    },
    {
      icon: <Bug className='h-4 w-4' />,
      label: 'Debug',
      action: 'debug',
      disabled: !selectedCode
    },
    {
      icon: <Lightbulb className='h-4 w-4' />,
      label: 'Complete',
      action: 'complete',
      disabled: !selectedCode
    }
  ];

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Sparkles className='h-5 w-5 text-purple-500' />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {selectedCode && (
          <div className='rounded-lg bg-gray-100 p-3 dark:bg-gray-800'>
            <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
              Selected Code:
            </p>
            <pre className='overflow-x-auto text-xs'>
              {selectedCode.length > 200
                ? selectedCode.substring(0, 200) + '...'
                : selectedCode}
            </pre>
          </div>
        )}

        <div className='grid grid-cols-2 gap-2'>
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant='outline'
              size='sm'
              disabled={action.disabled || isLoading}
              onClick={() => handleAIRequest(action.action)}
              className='flex items-center gap-2'
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        <div className='space-y-2'>
          <Textarea
            placeholder='Ask me anything about your code...'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <Button
            onClick={() => handleAIRequest('custom', prompt)}
            disabled={!prompt.trim() || isLoading}
            className='w-full'
          >
            {isLoading ? 'Thinking...' : 'Ask AI'}
          </Button>
        </div>

        {response && (
          <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
            <p className='mb-2 text-sm font-medium text-blue-800 dark:text-blue-200'>
              AI Response:
            </p>
            <div className='text-sm whitespace-pre-wrap text-blue-700 dark:text-blue-300'>
              {response}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
