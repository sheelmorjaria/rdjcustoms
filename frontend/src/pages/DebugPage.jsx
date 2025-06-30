import { useState, useEffect } from 'react';

const DebugPage = () => {
  const [debugInfo, setDebugInfo] = useState({
    apiUrl: '',
    envVars: {},
    healthCheck: null,
    productsCheck: null,
    corsTest: null,
    error: null
  });

  useEffect(() => {
    const runDebugChecks = async () => {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      // Collect environment variables
      const envVars = {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'NOT SET',
        VITE_API_URL: import.meta.env.VITE_API_URL || 'NOT SET',
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        BASE_URL: import.meta.env.BASE_URL
      };

      setDebugInfo(prev => ({ ...prev, apiUrl, envVars }));

      // Test 1: Health Check
      try {
        const healthResponse = await fetch(`${apiUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const healthData = await healthResponse.json();
        setDebugInfo(prev => ({ 
          ...prev, 
          healthCheck: { 
            status: healthResponse.status, 
            ok: healthResponse.ok,
            data: healthData 
          } 
        }));
      } catch (error) {
        setDebugInfo(prev => ({ 
          ...prev, 
          healthCheck: { 
            error: error.message,
            type: error.name,
            stack: error.stack
          } 
        }));
      }

      // Test 2: Products Endpoint
      try {
        const productsResponse = await fetch(`${apiUrl}/api/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!productsResponse.ok) {
          const errorText = await productsResponse.text();
          setDebugInfo(prev => ({ 
            ...prev, 
            productsCheck: { 
              status: productsResponse.status,
              statusText: productsResponse.statusText,
              error: errorText,
              headers: Object.fromEntries(productsResponse.headers.entries())
            } 
          }));
        } else {
          const productsData = await productsResponse.json();
          setDebugInfo(prev => ({ 
            ...prev, 
            productsCheck: { 
              status: productsResponse.status,
              ok: productsResponse.ok,
              dataLength: productsData.products?.length || 0,
              headers: Object.fromEntries(productsResponse.headers.entries())
            } 
          }));
        }
      } catch (error) {
        setDebugInfo(prev => ({ 
          ...prev, 
          productsCheck: { 
            error: error.message,
            type: error.name,
            stack: error.stack
          } 
        }));
      }

      // Test 3: CORS Test with credentials
      try {
        const corsResponse = await fetch(`${apiUrl}/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const corsData = await corsResponse.json();
        setDebugInfo(prev => ({ 
          ...prev, 
          corsTest: { 
            status: corsResponse.status,
            ok: corsResponse.ok,
            data: corsData,
            headers: Object.fromEntries(corsResponse.headers.entries())
          } 
        }));
      } catch (error) {
        setDebugInfo(prev => ({ 
          ...prev, 
          corsTest: { 
            error: error.message,
            type: error.name
          } 
        }));
      }
    };

    runDebugChecks();
  }, []);

  const copyToClipboard = () => {
    const debugText = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(debugText);
    alert('Debug info copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Debug Information</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          This page helps diagnose API connection issues. Share this information when reporting problems.
        </p>
      </div>

      <div className="space-y-6">
        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debugInfo.envVars, null, 2)}
          </pre>
        </div>

        {/* API URL */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configured API URL</h2>
          <p className="font-mono text-lg">{debugInfo.apiUrl}</p>
        </div>

        {/* Health Check */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Health Check (/api/health)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debugInfo.healthCheck, null, 2)}
          </pre>
        </div>

        {/* Products Check */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Products Endpoint (/api/products)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debugInfo.productsCheck, null, 2)}
          </pre>
        </div>

        {/* CORS Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">CORS Test (Root Endpoint)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(debugInfo.corsTest, null, 2)}
          </pre>
        </div>

        {/* Quick Fixes */}
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Common Fixes</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Ensure VITE_API_BASE_URL is set in Render dashboard (not VITE_API_URL)</li>
            <li>Backend CORS should include your frontend URL</li>
            <li>Both frontend and backend must use HTTPS in production</li>
            <li>Clear browser cache and hard refresh (Ctrl+Shift+R)</li>
          </ul>
        </div>

        <button
          onClick={copyToClipboard}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Copy Debug Info
        </button>
      </div>
    </div>
  );
};

export default DebugPage;