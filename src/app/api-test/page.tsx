"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/lib/axiosInstance';
import { API_CONFIG } from '@/lib/config';
import { readingFeaturesService } from '@/lib/services';
import DirectApiTest from './direct-test';

export default function ApiTestPage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [endpointResponse, setEndpointResponse] = useState<Record<string, any>>({});
  
  // Test direct Axios call to the API
  const testDirectApi = async () => {
    try {
      setApiStatus('loading');
      const response = await axiosInstance.get('/health-check');
      setApiResponse(response.data);
      setApiStatus('success');
    } catch (error: any) {
      console.error('API test failed:', error);
      setApiResponse(error.message || 'API call failed');
      setApiStatus('error');
    }
  };
  
  // Test a specific endpoint
  const testEndpoint = async (endpoint: string, label: string) => {
    setEndpointResponse(prev => ({ ...prev, [label]: { status: 'loading' } }));
    try {
      let result;
      switch (endpoint) {
        case 'challenges':
          result = await readingFeaturesService.challenges.getCurrentChallenge();
          break;
        case 'timer':
          result = await readingFeaturesService.timer.getSessions();
          break;
        case 'insights':
          result = await readingFeaturesService.insights.getInsights();
          break;
        case 'recommendations':
          result = await readingFeaturesService.recommendations.getRecommendations();
          break;
        case 'reminders':
          result = await readingFeaturesService.reminders.getReminders();
          break;
        case 'notes':
          result = await readingFeaturesService.notes.getNotes();
          break;
        default:
          throw new Error('Unknown endpoint');
      }
      setEndpointResponse(prev => ({ 
        ...prev, 
        [label]: { 
          status: 'success', 
          data: result,
          implementation: API_CONFIG.USE_API ? 'API' : 'localStorage'
        } 
      }));
    } catch (error: any) {
      console.error(`Test for ${label} failed:`, error);
      setEndpointResponse(prev => ({ 
        ...prev, 
        [label]: { 
          status: 'error', 
          error: error.message || 'Unknown error',
          implementation: API_CONFIG.USE_API ? 'API' : 'localStorage'
        } 
      }));
    }
  };
  
  useEffect(() => {
    // Test all endpoints on load
    testDirectApi();
    testEndpoint('challenges', 'Reading Challenges');
    testEndpoint('timer', 'Reading Sessions');
    testEndpoint('insights', 'Reading Insights');
    testEndpoint('recommendations', 'Book Recommendations');
    testEndpoint('reminders', 'Reading Reminders');
    testEndpoint('notes', 'Book Notes');
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">API Diagnostics</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* API Config */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>API Mode Enabled:</strong> {String(API_CONFIG.USE_API)}</div>
              <div><strong>API URL:</strong> {API_CONFIG.API_URL}</div>
              <div><strong>Implementation:</strong> {API_CONFIG.USE_API ? 'Backend API' : 'localStorage'}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Direct API Test */}
        <DirectApiTest />
        
        {/* Direct API Test */}
        <Card>
          <CardHeader>
            <CardTitle>Direct API Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testDirectApi}
                disabled={apiStatus === 'loading'}
              >
                Test API Connection
              </Button>
              
              {apiStatus === 'loading' && <div>Testing API connection...</div>}
              
              {apiStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-bold text-green-600">API Connection Successful</h3>
                  <pre className="mt-2 text-sm bg-black text-white p-4 rounded overflow-auto">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
              
              {apiStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="font-bold text-red-600">API Connection Failed</h3>
                  <div className="mt-2">{apiResponse}</div>
                  <div className="mt-4">
                    <h4 className="font-semibold">Possible Issues:</h4>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Backend server not running at {API_CONFIG.API_URL}</li>
                      <li>CORS issues preventing connection</li>
                      <li>Network connectivity problems</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Endpoint Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Features API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(endpointResponse).map(([label, response]: [string, any]) => (
                <div key={label} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">{label}</h3>
                    <Button 
                      size="sm"
                      variant={response.status === 'error' ? 'destructive' : 'outline'}
                      onClick={() => testEndpoint(label.toLowerCase().replace(' ', '-'), label)}
                      disabled={response.status === 'loading'}
                    >
                      Retry
                    </Button>
                  </div>
                  
                  {response.status === 'loading' && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span>Loading...</span>
                    </div>
                  )}
                  
                  {response.status === 'success' && (
                    <div>
                      <div className="text-sm mb-2">
                        <span className="font-semibold">Implementation:</span> {response.implementation}
                      </div>
                      <div className="p-2 bg-green-50 border border-green-200 rounded-md text-green-700">
                        Success
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">View Response Data</summary>
                        <pre className="mt-2 text-xs bg-black text-white p-4 rounded overflow-auto max-h-60">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                  
                  {response.status === 'error' && (
                    <div>
                      <div className="text-sm mb-2">
                        <span className="font-semibold">Implementation:</span> {response.implementation}
                      </div>
                      <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-700">
                        Error: {response.error}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 