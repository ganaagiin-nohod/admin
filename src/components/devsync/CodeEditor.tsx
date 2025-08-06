'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import { CodeChange } from '@/types/devsync';

interface CodeEditorProps {
  sessionId: string;
  userId: string;
  initialCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
}

export default function CodeEditor({
  sessionId,
  userId,
  initialCode = '',
  language = 'javascript',
  onCodeChange
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [socket, setSocket] = useState<Socket | null>(null);
  const editorRef = useRef<any>(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join-session', sessionId, userId);

    newSocket.on('code-change', (change: CodeChange) => {
      if (change.userId !== userId && editorRef.current) {
        isRemoteChange.current = true;

        const model = editorRef.current.getModel();
        const position = model.getPositionAt(change.position.line);

        switch (change.type) {
          case 'insert':
            model.applyEdits([
              {
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column
                },
                text: change.content
              }
            ]);
            break;
          case 'delete':
            model.applyEdits([
              {
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column + change.content.length
                },
                text: ''
              }
            ]);
            break;
        }

        setCode(model.getValue());
        isRemoteChange.current = false;
      }
    });

    newSocket.on(
      'cursor-move',
      (data: {
        userId: string;
        position: { line: number; column: number };
      }) => {
        if (data.userId !== userId && editorRef.current) {
          console.log(`User ${data.userId} cursor at:`, data.position);
        }
      }
    );

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, userId]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value || isRemoteChange.current) return;

    setCode(value);
    onCodeChange?.(value);

    if (socket) {
      const change: CodeChange = {
        sessionId,
        userId,
        type: 'replace',
        position: { line: 0, column: 0 },
        content: value,
        timestamp: new Date()
      };

      socket.emit('code-change', change);
    }
  };

  const handleCursorPositionChange = (e: any) => {
    if (socket && e.position) {
      socket.emit('cursor-move', {
        sessionId,
        userId,
        position: {
          line: e.position.lineNumber,
          column: e.position.column
        }
      });
    }
  };

  return (
    <div className='h-full w-full'>
      <Editor
        height='100%'
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={(editor) => {
          editorRef.current = editor;
          editor.onDidChangeCursorPosition(handleCursorPositionChange);
        }}
        theme='vs-dark'
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line'
        }}
      />
    </div>
  );
}
