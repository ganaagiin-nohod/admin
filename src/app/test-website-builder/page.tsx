'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestWebsiteBuilder() {
  const [result, setResult] = useState<string>('');

  const testAPI = async () => {
    try {
      // Test demo creation
      const demoResponse = await fetch('/api/demo');
      const demoData = await demoResponse.json();

      if (demoResponse.ok) {
        setResult(
          `Demo website created: ${demoData.website.title} at /site/${demoData.website.slug}`
        );
      } else {
        setResult(`Error: ${demoData.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const testWebsiteAPI = async () => {
    try {
      // Test website fetching
      const response = await fetch('/api/websites');
      const data = await response.json();

      if (response.ok) {
        setResult(`Found ${data.websites?.length || 0} websites`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Website Builder Test</h1>

      <div className='space-y-4'>
        <Button onClick={testAPI}>Test Demo Creation</Button>
        <Button onClick={testWebsiteAPI}>Test Website API</Button>

        {result && (
          <div className='rounded bg-gray-100 p-4'>
            <p>{result}</p>
          </div>
        )}

        <div className='mt-8'>
          <h2 className='mb-4 text-xl font-semibold'>Quick Links:</h2>
          <ul className='space-y-2'>
            <li>
              <a
                href='/dashboard/website-builder'
                className='text-blue-600 hover:underline'
              >
                Website Builder Dashboard
              </a>
            </li>
            <li>
              <a
                href='/site/demo-portfolio'
                className='text-blue-600 hover:underline'
              >
                Demo Portfolio Site
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
