import React from 'react';
import { jwtDecode } from 'jwt-decode';

const TestAuth = () => {
  console.log('🧪 TestAuth component loaded');

  const token = localStorage.getItem('access_token');
  console.log('Token from localStorage:', token);

  let user = null;
  let error = null;

  try {
    if (token) {
      user = jwtDecode(token);
      console.log('Decoded user:', user);
    }
  } catch (err) {
    error = err.message;
    console.error('Token decode error:', err);
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Token Status</h2>
        <p>
          <strong>Token exists:</strong> {token ? '✅ Yes' : '❌ No'}
        </p>
        {token && (
          <div className="mt-2">
            <p>
              <strong>Token preview:</strong> {token.substring(0, 50)}...
            </p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">User Information</h2>
        {error ? (
          <p className="text-red-600">
            <strong>Decode Error:</strong> {error}
          </p>
        ) : user ? (
          <div>
            <p>
              <strong>User exists:</strong> ✅ Yes
            </p>
            <p>
              <strong>Email:</strong> {user.email || 'Not found'}
            </p>
            <p>
              <strong>Role:</strong> {user.role || 'Not found'}
            </p>
            <p>
              <strong>User ID:</strong>{' '}
              {user.sub || user.user_id || 'Not found'}
            </p>
            <p>
              <strong>Expires:</strong>{' '}
              {user.exp
                ? new Date(user.exp * 1000).toLocaleString()
                : 'Not found'}
            </p>
            <div className="mt-2">
              <strong>Full user object:</strong>
              <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-red-600">❌ No user found</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Access Check</h2>
        <p>
          <strong>Can access admin dashboard:</strong>{' '}
          {user &&
          (user.roles?.includes('admin') ||
            user.roles?.includes('teacher') ||
            user.role === 'admin' ||
            user.role === 'teacher')
            ? '✅ Yes'
            : '❌ No'}
        </p>
        {user && (
          <p>
            <strong>Reason:</strong>{' '}
            {user.roles?.includes('admin') || user.role === 'admin'
              ? 'User is admin'
              : user.roles?.includes('teacher') || user.role === 'teacher'
              ? 'User is teacher'
              : `User role is '${
                  user.role || user.roles
                }' (must be 'admin' or 'teacher')`}
          </p>
        )}
      </div>
    </div>
  );
};

export default TestAuth;
