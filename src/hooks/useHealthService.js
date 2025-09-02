/**
 * React Hook for Health Service
 * Provides easy access to health status and controls
 */

import { useState, useEffect, useCallback } from 'react';
import healthService from '../services/healthService';

export const useHealthService = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Subscribe to health updates
    const unsubscribe = healthService.subscribe(setHealthStatus);

    // Get initial status
    const initialStatus = healthService.getLastHealthStatus();
    if (initialStatus) {
      setHealthStatus(initialStatus);
    }

    // Update running status
    setIsRunning(healthService.isHealthServiceRunning());

    // Update stats
    setStats(healthService.getStats());

    return unsubscribe;
  }, []);

  const startHealthService = useCallback(() => {
    healthService.start();
    setIsRunning(true);
  }, []);

  const stopHealthService = useCallback(() => {
    healthService.stop();
    setIsRunning(false);
  }, []);

  const checkNow = useCallback(async () => {
    return await healthService.checkNow();
  }, []);

  const checkDetailed = useCallback(async () => {
    return await healthService.performDetailedHealthCheck();
  }, []);

  const setInterval = useCallback((intervalMs) => {
    healthService.setCheckInterval(intervalMs);
  }, []);

  return {
    // Status
    healthStatus,
    isRunning,
    stats,

    // Controls
    start: startHealthService,
    stop: stopHealthService,
    checkNow,
    checkDetailed,
    setInterval,
  };
};

export default useHealthService;
