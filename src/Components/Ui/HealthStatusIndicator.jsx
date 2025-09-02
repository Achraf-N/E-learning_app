import React, { useState, useEffect } from 'react';
import healthService from '../../services/healthService';

const HealthStatusIndicator = ({ showDetails = false, className = '' }) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [detailedStatus, setDetailedStatus] = useState(null);

  useEffect(() => {
    // Subscribe to health updates
    const unsubscribe = healthService.subscribe(setHealthStatus);

    // Get initial status
    const initialStatus = healthService.getLastHealthStatus();
    if (initialStatus) {
      setHealthStatus(initialStatus);
    }

    // Check if health service is running, if not start it
    if (!healthService.isHealthServiceRunning()) {
      healthService.start();
    }

    return unsubscribe;
  }, []);

  const handleDetailedCheck = async () => {
    setDetailedStatus({ loading: true });
    const detailed = await healthService.performDetailedHealthCheck();
    setDetailedStatus(detailed);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy':
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  if (!healthStatus) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Checking health...</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Compact Status Indicator */}
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200 hover:shadow-sm ${getStatusColor(
          healthStatus.status
        )}`}
        onClick={() => setIsVisible(!isVisible)}
      >
        {getStatusIcon(healthStatus.status)}
        <span className="capitalize">{healthStatus.status}</span>
        {healthStatus.responseTime && (
          <span className="text-xs opacity-75">
            ({healthStatus.responseTime}ms)
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            isVisible ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Detailed Status Panel */}
      {isVisible && showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">System Health</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`text-sm font-medium capitalize ${
                    healthStatus.status === 'healthy'
                      ? 'text-green-600'
                      : healthStatus.status === 'degraded'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {healthStatus.status}
                </span>
              </div>

              {healthStatus.service && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service:</span>
                  <span className="text-sm font-medium">
                    {healthStatus.service}
                  </span>
                </div>
              )}

              {healthStatus.responseTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time:</span>
                  <span className="text-sm font-medium">
                    {healthStatus.responseTime}ms
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Check:</span>
                <span className="text-sm font-medium">
                  {healthStatus.timestamp
                    ? new Date(healthStatus.timestamp).toLocaleTimeString()
                    : 'Never'}
                </span>
              </div>

              {healthStatus.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <span className="text-sm text-red-800">
                    {healthStatus.error}
                  </span>
                </div>
              )}
            </div>

            {/* Detailed Health Check Button */}
            <div className="pt-2 border-t">
              <button
                onClick={handleDetailedCheck}
                disabled={detailedStatus?.loading}
                className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 transition-colors"
              >
                {detailedStatus?.loading ? 'Checking...' : 'Run Detailed Check'}
              </button>

              {detailedStatus && !detailedStatus.loading && (
                <div className="mt-3 space-y-2 text-sm">
                  {detailedStatus.databaseStatus && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Database:</span>
                        <span
                          className={`font-medium capitalize ${
                            detailedStatus.databaseStatus === 'healthy'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {detailedStatus.databaseStatus}
                        </span>
                      </div>
                      {detailedStatus.databaseResponseTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">DB Response:</span>
                          <span className="font-medium">
                            {detailedStatus.databaseResponseTime}ms
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {detailedStatus.error && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                      <span className="text-red-800">
                        {detailedStatus.error}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Check Button */}
            <button
              onClick={() => healthService.checkNow()}
              className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Manual Health Check
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthStatusIndicator;
