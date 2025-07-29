'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [apiResult, setApiResult] = useState<any>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setApiResult(data);
    } catch (error) {
      setApiResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setLoading(false);
  };

  const testUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setUploadResult({
        status: response.status,
        data: data
      });
    } catch (error) {
      setUploadResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setLoading(false);
  };

  return (
    <div className='mx-auto max-w-2xl space-y-6 p-8'>
      <h1 className='text-2xl font-bold'>Debug Page</h1>

      <div className='rounded border p-4'>
        <h2 className='mb-2 text-lg font-semibold'>API Test</h2>
        <button
          onClick={testAPI}
          disabled={loading}
          className='rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300'
        >
          Test API
        </button>
        {apiResult && (
          <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs'>
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        )}
      </div>

      <div className='rounded border p-4'>
        <h2 className='mb-2 text-lg font-semibold'>Upload Test</h2>
        <input
          type='file'
          accept='image/*'
          onChange={testUpload}
          disabled={loading}
          className='block w-full text-sm text-gray-500'
        />
        {uploadResult && (
          <pre className='mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs'>
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        )}
      </div>

      <div className='text-sm text-gray-600'>
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>
          URL: {typeof window !== 'undefined' ? window.location.href : 'Server'}
        </p>
      </div>
    </div>
  );
}
