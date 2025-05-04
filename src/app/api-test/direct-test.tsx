"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_CONFIG } from '@/lib/config';

export default function DirectApiTest() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Test using native fetch to rule out axios issues
  const testDirectFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the attempt
      console.log(`Attempting direct fetch to ${API_CONFIG.API_URL}/health-check`);
      
      // Use native fetch instead of axios
      const response = await fetch(`${API_CONFIG.API_URL}/health-check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // No credentials for simpler testing
      });
      
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetch response data:', data);
      setResult(data);
    } catch (err: any) {
      console.error('Direct fetch failed:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Direct Fetch Test (Bypasses Axios)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p>This test uses the browser's native fetch API to rule out any issues with Axios configuration.</p>
          </div>
          
          <Button 
            onClick={testDirectFetch}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Direct Fetch'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-bold text-red-600">Fetch Failed</h3>
              <p className="mt-2">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-bold text-green-600">Fetch Successful</h3>
              <pre className="mt-2 text-sm bg-black text-white p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 