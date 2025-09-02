/**
 * Health Check Service
 * Handles periodic health checks to prevent cold starts
 */

import { HEALTH_CONFIG } from '../config/api';

class HealthService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 2 * 60 * 1000; // 2 minutes
    this.lastHealthStatus = null;
    this.callbacks = new Set();
  }

  /**
   * Start periodic health checks
   */
  start() {
    if (this.isRunning) {
      console.log('Health service is already running');
      return;
    }

    console.log('Starting health service...');
    this.isRunning = true;

    // Initial health check
    this.performHealthCheck();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }

  /**
   * Stop periodic health checks
   */
  stop() {
    if (!this.isRunning) {
      console.log('Health service is not running');
      return;
    }

    console.log('Stopping health service...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Perform a basic health check
   */
  async performHealthCheck() {
    try {
      const startTime = Date.now();

      const response = await fetch(HEALTH_CONFIG.BASIC, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't include auth headers for health check
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();

        this.lastHealthStatus = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime,
          service: data.service || 'unknown',
          serverUptime: data.uptime || 0,
        };

        console.log(`Health check successful (${responseTime}ms)`, {
          service: data.service,
          serverTimestamp: data.timestamp,
        });
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.lastHealthStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };

      console.warn('Health check failed:', error.message);
    }

    // Notify callbacks
    this.notifyCallbacks(this.lastHealthStatus);
  }

  /**
   * Perform a detailed health check (includes DB connectivity)
   */
  async performDetailedHealthCheck() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.log('No auth token, skipping detailed health check');
      return null;
    }

    try {
      const startTime = Date.now();

      const response = await fetch(HEALTH_CONFIG.DETAILED, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();

        const detailedStatus = {
          status: data.status,
          timestamp: new Date().toISOString(),
          responseTime,
          service: data.service,
          serverResponseTime: data.response_time_ms,
          databaseStatus: data.checks?.database?.status,
          databaseResponseTime: data.checks?.database?.response_time_ms,
        };

        console.log(
          `Detailed health check successful (${responseTime}ms)`,
          detailedStatus
        );
        return detailedStatus;
      } else {
        throw new Error(`Detailed health check failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('Detailed health check failed:', error.message);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Get the last health status
   */
  getLastHealthStatus() {
    return this.lastHealthStatus;
  }

  /**
   * Check if the service is currently running
   */
  isHealthServiceRunning() {
    return this.isRunning;
  }

  /**
   * Subscribe to health status updates
   */
  subscribe(callback) {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers of health status changes
   */
  notifyCallbacks(status) {
    this.callbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in health status callback:', error);
      }
    });
  }

  /**
   * Set custom check interval
   */
  setCheckInterval(intervalMs) {
    this.checkInterval = intervalMs;

    if (this.isRunning) {
      // Restart with new interval
      this.stop();
      this.start();
    }
  }

  /**
   * Manual health check trigger
   */
  async checkNow() {
    return await this.performHealthCheck();
  }

  /**
   * Get health service statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      lastCheck: this.lastHealthStatus?.timestamp,
      subscriberCount: this.callbacks.size,
    };
  }
}

// Create singleton instance
const healthService = new HealthService();

// Auto-start in production
if (import.meta.env.PROD) {
  // Start health checks when the module loads
  setTimeout(() => {
    healthService.start();
  }, 5000); // Wait 5 seconds after app load
}

export default healthService;
