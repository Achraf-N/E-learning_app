/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints via API Gateway
 */

// API Gateway Base URL
const API_BASE_URL =
  'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1';

// Content API URL (for uploads and media)
const CONTENT_API_URL =
  'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/content';

// Debug settings
const DEBUG_API = import.meta.env.VITE_DEBUG_API === 'true';
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info';

// Timeout and retry configuration
export const REQUEST_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
  retryMultiplier: 2, // Exponential backoff
};

// API Endpoints organized by feature (via API Gateway)
export const API_CONFIG = {
  // Authentication & User Management (direct routing)
  AUTH: {
    LOGIN: `${API_BASE_URL}/login`,
    REGISTER: `${API_BASE_URL}/register`,
    OAUTH_LOGIN: `${API_BASE_URL}/oauth-login`,
    VERIFY_EMAIL: `${API_BASE_URL}/verify-email`,
    REFRESH_TOKEN: `${API_BASE_URL}/refresh`,
    LOGOUT: `${API_BASE_URL}/logout`,
    PROFILE: `${API_BASE_URL}/users/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/change-password`,
  },

  // Courses & Modules (via /content/ prefix)
  COURSES: {
    LIST_ALL: `${API_BASE_URL}/content/modules`,
    GET_BY_ID: (id) => `${API_BASE_URL}/content/modules/${id}`,
    CREATE: `${API_BASE_URL}/content/admin/courses`,
    UPDATE: (id) => `${API_BASE_URL}/content/admin/courses/${id}`,
    DELETE: (id) => `${API_BASE_URL}/content/admin/courses/${id}`,
    SEARCH: `${API_BASE_URL}/content/modules/search`,
  },

  // User Progress & Analytics (via /content/ prefix)
  PROGRESS: {
    GET_ALL: `${API_BASE_URL}/userprogress`,
    GET_BY_COURSE: (courseId) =>
      `${API_BASE_URL}/userprogress/course/${courseId}`,
    GET_BY_LESSON: (lessonId) =>
      `${API_BASE_URL}/userprogress/?lesson_id=${lessonId}`,
    UPDATE: (lessonId) => `${API_BASE_URL}/userprogress/?lesson_id=${lessonId}`,
    DELETE: (lessonId) => `${API_BASE_URL}/userprogress/${lessonId}`,
    STATS: `${API_BASE_URL}/userprogress/stats`,
  },

  // Module Progress (Course-level progress)
  MODULE_PROGRESS: {
    CREATE: `${API_BASE_URL}/userprogress`,
    GET_BY_USER: (userId) => `${API_BASE_URL}/userprogress/?user_id=${userId}`,
    GET_BY_MODULE: (moduleId) =>
      `${API_BASE_URL}/userprogress?module_id=${moduleId}`,
    UPDATE: (progressId) => `${API_BASE_URL}/userprogress/${progressId}`,
    DELETE: (progressId) => `${API_BASE_URL}/userprogress/${progressId}`,
    UNLOCK_MODULE: (progressId) =>
      `${API_BASE_URL}/userprogress/${progressId}/unlock`,
    GET_BY_SEMESTER: (userId, semester) =>
      `${API_BASE_URL}/userprogress?user_id=${userId}&semester=${semester}`,
    CHECK_SEMESTER_COMPLETION: (userId, semester) =>
      `${API_BASE_URL}/userprogress/semester/${semester}/completion?user_id=${userId}`,
    INITIALIZE: `${API_BASE_URL}/userprogress/initialize`,
    DASHBOARD: `${API_BASE_URL}/userprogress/dashboard/progress`,
    STATS: `${API_BASE_URL}/userprogress/stats`,
    UPDATE_PERCENTAGE: (moduleId, percentage) =>
      `${API_BASE_URL}/userprogress/${moduleId}/progress/${percentage}`,
  },

  // Content & Lessons (via /content/ prefix)
  CONTENT: {
    LESSONS: {
      LIST: `${API_BASE_URL}/content/lessons`,
      GET_BY_ID: (id) => `${API_BASE_URL}/content/lessons/${id}`,
      CREATE: `${API_BASE_URL}/content/lessons`,
      UPDATE: (id) => `${API_BASE_URL}/content/lessons/${id}`,
      DELETE: (id) => `${API_BASE_URL}/content/lessons/${id}`,
    },
    QUIZ: {
      GET: (lessonId) => `${API_BASE_URL}/content/quiz/${lessonId}`,
      SUBMIT: (lessonId) => `${API_BASE_URL}/content/quiz/${lessonId}/submit`,
      RESULTS: (lessonId) => `${API_BASE_URL}/content/quiz/${lessonId}/results`,
    },
  },

  // Admin & Management (via /content/ prefix for content, direct for users)
  ADMIN: {
    DASHBOARD: {
      STATS: `${API_BASE_URL}/content/admin/stats`,
      COURSES_COUNT: `${API_BASE_URL}/content/admin/stats/courses`,
      STUDENTS_COUNT: `${API_BASE_URL}/content/admin/stats/students`,
      VIDEOS_COUNT: `${API_BASE_URL}/content/admin/stats/videos`,
      REVENUE: `${API_BASE_URL}/content/admin/stats/revenue`,
    },
    VIMEO: {
      CREATE_UPLOAD: `${API_BASE_URL}/content/vimeo/upload`,
      UPDATE_METADATA: (videoId) =>
        `${API_BASE_URL}/content/vimeo/update-metadata/${videoId}`,
      DELETE_VIDEO: (videoId) =>
        `${API_BASE_URL}/content/vimeo/delete/${videoId}`,
    },
    LESSONS: {
      CREATE: `${API_BASE_URL}/content/lessons`,
      UPDATE: (id) => `${API_BASE_URL}/content/lessons/${id}`,
      DELETE: (id) => `${API_BASE_URL}/content/lessons/${id}`,
    },
    USERS: {
      LIST: `${API_BASE_URL}/admin/users`,
      GET_BY_ID: (id) => `${API_BASE_URL}/admin/users/${id}`,
      UPDATE_ROLE: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
      DELETE: (id) => `${API_BASE_URL}/admin/users/${id}`,
      BLOCK: (id) => `${API_BASE_URL}/admin/users/${id}/block`,
      UNBLOCK: (id) => `${API_BASE_URL}/admin/users/${id}/unblock`,
    },
  },

  // Payment & Subscriptions
  PAYMENT: {
    CREATE_INTENT: `${API_BASE_URL}/payment/create-intent`,
    CONFIRM_PAYMENT: `${API_BASE_URL}/payment/confirm`,
    SUBSCRIPTION_STATUS: `${API_BASE_URL}/payment/subscription`,
    BILLING_HISTORY: `${API_BASE_URL}/payment/history`,
  },

  // File Uploads
  UPLOADS: {
    IMAGE: `${CONTENT_API_URL}/uploads/image`,
    VIDEO: `${CONTENT_API_URL}/uploads/video`,
    DOCUMENT: `${CONTENT_API_URL}/uploads/document`,
  },
};

// Helper functions for dynamic endpoint construction
export const buildEndpoint = (template, params = {}) => {
  let endpoint = template;
  Object.keys(params).forEach((key) => {
    endpoint = endpoint.replace(`:${key}`, params[key]);
  });
  return endpoint;
};

// Query parameter helpers
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined) {
      searchParams.append(key, params[key]);
    }
  });
  return searchParams.toString();
};

// API Response types for TypeScript-like documentation
export const API_RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle',
};

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Error types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Debug logging
export const debugLog = (message, data = null) => {
  if (DEBUG_API && LOG_LEVEL === 'info') {
    console.log(`[API] ${message}`, data || '');
  }
};

export const errorLog = (message, error = null) => {
  if (DEBUG_API) {
    console.error(`[API ERROR] ${message}`, error || '');
  }
};

export default API_CONFIG;
