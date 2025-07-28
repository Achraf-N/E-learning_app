import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const QuickTest = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');

  const checkToken = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No token found. Please login first.');
        setTokenInfo(null);
        return;
      }

      const decoded = jwtDecode(token);
      setTokenInfo(decoded);
      setError('');
    } catch (err) {
      setError('Error decoding token: ' + err.message);
      setTokenInfo(null);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('access_token');
    setTokenInfo(null);
    setError('Token cleared. Please login again.');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick Token Test</h1>

      <div className="space-y-4">
        <button
          onClick={checkToken}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check Current Token
        </button>

        <button
          onClick={clearToken}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
        >
          Clear Token (Logout)
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {tokenInfo && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h2 className="font-bold text-lg mb-2">✅ Token Information:</h2>
          <div className="space-y-2">
            <p>
              <strong>User ID:</strong> {tokenInfo.sub || 'Not found'}
            </p>
            <p>
              <strong>Email:</strong> {tokenInfo.email || 'Not found'}
            </p>
            <p>
              <strong>Role:</strong> {tokenInfo.role || '❌ MISSING ROLE!'}
            </p>
            <p>
              <strong>Expires:</strong>{' '}
              {tokenInfo.exp
                ? new Date(tokenInfo.exp * 1000).toLocaleString()
                : 'Not found'}
            </p>
          </div>

          <div className="mt-4">
            <strong>Dashboard Access:</strong>{' '}
            {tokenInfo.roles?.includes('admin') ||
            tokenInfo.roles?.includes('teacher') ||
            tokenInfo.role === 'admin' ||
            tokenInfo.role === 'teacher'
              ? '✅ ALLOWED'
              : '❌ DENIED - Need admin or teacher role'}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">
              Full Token Data
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <h3 className="font-bold">Instructions:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Click "Clear Token" to logout</li>
          <li>
            Go to{' '}
            <a href="/Login" className="underline text-blue-800">
              /Login
            </a>{' '}
            and login with admin credentials
          </li>
          <li>Come back here and click "Check Current Token"</li>
          <li>Verify that the role field is now present</li>
          <li>
            If role shows up, try accessing{' '}
            <a href="/admin/dashboard" className="underline text-blue-800">
              /admin/dashboard
            </a>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default QuickTest;
