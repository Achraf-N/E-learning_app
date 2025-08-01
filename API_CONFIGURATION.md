# API Configuration & Backend Implementation Guide

## 🏗️ **Microservices Architecture Overview**

Your e-learning platform uses a microservices architecture with an **API Gateway** that routes requests to different services:

**API Gateway**: `localhost:8000/api/v1` (Single entry point)

### **Service Routing:**

- **Authentication endpoints** → `auth-service` (direct routing)
- **Content endpoints** → `content-service` (via `/content/` prefix)

```javascript
const API_BASE = 'http://localhost:8000/api/v1';

// 🔐 Auth endpoints (direct routing)
POST`${API_BASE}/refresh`; // → auth-service/api/v1/refresh
POST`${API_BASE}/login`; // → auth-service/api/v1/login
POST`${API_BASE}/register`; // → auth-service/api/v1/register
GET`${API_BASE}/users/me`; // → auth-service/api/v1/users/me

// 📚 Content endpoints (via /content/ prefix)
GET`${API_BASE}/content/lessons`; // → content-service/api/v1/lessons
POST`${API_BASE}/content/lessons`; // → content-service/api/v1/lessons
GET`${API_BASE}/content/modules`; // → content-service/api/v1/modules
GET`${API_BASE}/content/quiz`; // → content-service/api/v1/quiz
POST`${API_BASE}/content/vimeo/upload`; // → content-service/api/v1/vimeo/upload
GET`${API_BASE}/content/users_progress`; // → content-service/api/v1/users_progress
```

---

## 🔐 **1. Authentication Service (via API Gateway)**

All authentication requests go through: `${API_BASE}` (http://localhost:8000/api/v1)

### **Required Endpoints:**

#### **Authentication Endpoints**

```http
POST ${API_BASE}/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}

Response (200):
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "student|teacher|admin",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

```http
POST ${API_BASE}/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "mot_de_passe": "password123",
  "first_name": "John",
  "last_name": "Doe"
}

Response (201):
{
  "message": "User created successfully",
  "user_id": "uuid",
  "verification_required": true
}
```

```http
POST ${API_BASE}/oauth-login
Content-Type: application/json

Request Body:
{
  "token": "google_jwt_token_here"
}

Response (200):
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {...}
}
```

```http
POST ${API_BASE}/refresh
Authorization: Bearer {refresh_token}

Response (200):
{
  "access_token": "new_jwt_token",
  "expires_in": 3600
}
```

```http
POST ${API_BASE}/verify-email
Content-Type: application/json

Request Body:
{
  "token": "verification_token",
  "email": "user@example.com"
}

Response (200):
{
  "message": "Email verified successfully"
}
```

```http
POST ${API_BASE}/logout
Authorization: Bearer {access_token}

Response (200):
{
  "message": "Logged out successfully"
}
```

#### **Profile Management**

```http
GET ${API_BASE}/users/me
Authorization: Bearer {access_token}

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

```http
PUT ${API_BASE}/users/me
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "first_name": "John",
  "last_name": "Doe"
}

Response (200):
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

```http
PUT ${API_BASE}/change-password
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "current_password": "old_password",
  "new_password": "new_password"
}

Response (200):
{
  "message": "Password changed successfully"
}
```

#### **Admin User Management**

```http
GET ${API_BASE}/admin/users
Authorization: Bearer {admin_token}
Query Parameters: ?page=1&limit=20&role=student&search=john

Response (200):
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student",
      "is_active": true,
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

```http
GET ${API_BASE}/admin/users/{user_id}
Authorization: Bearer {admin_token}

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "is_active": true,
  "is_verified": true,
  "last_login": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

```http
PUT ${API_BASE}/admin/users/{user_id}/role
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "role": "teacher"
}

Response (200):
{
  "message": "User role updated successfully",
  "user": {...}
}
```

```http
DELETE ${API_BASE}/admin/users/{user_id}
Authorization: Bearer {admin_token}

Response (200):
{
  "message": "User deleted successfully"
}
```

```http
POST ${API_BASE}/admin/users/{user_id}/block
Authorization: Bearer {admin_token}

Response (200):
{
  "message": "User blocked successfully"
}
```

```http
POST ${API_BASE}/admin/users/{user_id}/unblock
Authorization: Bearer {admin_token}

Response (200):
{
  "message": "User unblocked successfully"
}
```

---

## 📚 **2. Content Management Service (via API Gateway)**

All content requests go through: `${API_BASE}/content` (http://localhost:8000/api/v1/content)

### **Course & Module Endpoints**

#### **Public Course Access**

```http
GET ${API_BASE}/content/modules
Response (200):
[
  {
    "id": "uuid",
    "name": "Course Title",
    "description": "Course description",
    "image_url": "https://example.com/image.jpg",
    "price": 99.99,
    "instructor_id": "uuid",
    "instructor_name": "Teacher Name",
    "lessons": [
      {
        "id": "uuid",
        "title": "Lesson Title",
        "description": "Lesson description",
        "video_url": "https://vimeo.com/123456",
        "duration": 1800,
        "order": 1
      }
    ],
    "total_lessons": 10,
    "total_duration": 18000,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

```http
GET ${API_BASE}/content/modules/{course_id}
Response (200):
{
  "id": "uuid",
  "name": "Course Title",
  "description": "Course description",
  "lessons": [...],
  "instructor": {...}
}
```

#### **Admin Course Management**

```http
POST ${API_BASE}/content/admin/courses
Authorization: Bearer {admin_or_teacher_token}
Content-Type: application/json

Request Body:
{
  "name": "New Course",
  "description": "Course description",
  "price": 99.99,
  "image_url": "https://example.com/image.jpg",
  "instructor_id": "uuid"
}

Response (201):
{
  "id": "uuid",
  "message": "Course created successfully",
  "course": {...}
}
```

```http
PUT ${API_BASE}/content/admin/courses/{course_id}
Authorization: Bearer {admin_or_teacher_token}
Content-Type: application/json

Request Body:
{
  "name": "Updated Course",
  "description": "Updated description",
  "price": 149.99
}

Response (200):
{
  "message": "Course updated successfully",
  "course": {...}
}
```

```http
DELETE ${API_BASE}/content/admin/courses/{course_id}
Authorization: Bearer {admin_token}

Response (200):
{
  "message": "Course deleted successfully"
}
```

#### **Lesson Management**

```http
GET ${API_BASE}/content/lessons
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Lesson Title",
    "description": "Lesson description",
    "video_url": "https://vimeo.com/123456",
    "video_type": "vimeo",
    "vimeo_id": "123456",
    "duration": 1800,
    "order": 1
  }
]
```

```http
POST ${API_BASE}/content/lessons
Authorization: Bearer {admin_or_teacher_token}
Content-Type: application/json

Request Body:
{
  "course_id": "uuid",
  "title": "Lesson Title",
  "description": "Lesson description",
  "video_url": "https://vimeo.com/123456",
  "video_type": "vimeo",
  "vimeo_id": "123456",
  "duration": 1800,
  "order": 1
}

Response (201):
{
  "id": "uuid",
  "message": "Lesson created successfully",
  "lesson": {...}
}
```

```http
PUT ${API_BASE}/content/lessons/{lesson_id}
Authorization: Bearer {admin_or_teacher_token}
Content-Type: application/json

Request Body:
{
  "title": "Updated Lesson",
  "description": "Updated description"
}

Response (200):
{
  "message": "Lesson updated successfully",
  "lesson": {...}
}
```

```http
DELETE ${API_BASE}/content/lessons/{lesson_id}
Authorization: Bearer {admin_or_teacher_token}

Response (200):
{
  "message": "Lesson deleted successfully"
}
```

#### **Course Enrollment**

```http
POST ${API_BASE}/content/courses/{course_id}/enroll
Authorization: Bearer {student_token}

Response (201):
{
  "message": "Enrolled successfully",
  "enrollment": {
    "id": "uuid",
    "course_id": "uuid",
    "user_id": "uuid",
    "enrolled_at": "2024-01-01T00:00:00Z"
  }
}
```

```http
GET ${API_BASE}/content/courses/my-courses
Authorization: Bearer {student_token}

Response (200):
{
  "enrolled_courses": [
    {
      "id": "uuid",
      "name": "Course Title",
      "progress_percentage": 45.5,
      "enrolled_at": "2024-01-01T00:00:00Z",
      "last_accessed": "2024-01-02T00:00:00Z"
    }
  ]
}
```

```http
DELETE ${API_BASE}/content/courses/{course_id}/unenroll
Authorization: Bearer {student_token}

Response (200):
{
  "message": "Unenrolled successfully"
}
```

#### **Progress Tracking**

```http
GET ${API_BASE}/content/users_progress
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "uuid",
    "lesson_id": "uuid",
    "user_id": "uuid",
    "completed": true,
    "score": 85,
    "video_watched": true,
    "completed_at": "2024-01-01T00:00:00Z"
  }
]
```

```http
GET ${API_BASE}/content/users_progress/course/{course_id}
Authorization: Bearer {token}

Response (200):
[
  {
    "lesson_id": "uuid",
    "completed": true,
    "score": 85,
    "video_watched": true
  }
]
```

```http
PUT ${API_BASE}/content/users_progress/?lesson_id={lesson_id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "completed": true,
  "score": 85,
  "video_watched": true
}

Response (200):
{
  "message": "Progress updated successfully",
  "progress": {...}
}
```

#### **Quiz System**

```http
GET ${API_BASE}/content/quiz/{lesson_id}
Authorization: Bearer {token}

Response (200):
{
  "id": "uuid",
  "lesson_id": "uuid",
  "questions": [
    {
      "id": "uuid",
      "question": "What is React?",
      "type": "multiple_choice",
      "options": ["Library", "Framework", "Language", "Tool"],
      "correct_answer": 0
    }
  ]
}
```

```http
POST ${API_BASE}/content/quiz/{lesson_id}/submit
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "answers": [0, 1, 2],
  "time_spent": 300
}

Response (200):
{
  "score": 85,
  "total_questions": 3,
  "correct_answers": 2,
  "passed": true
}
```

#### **Admin Statistics (Critical for Dashboard)**

```http
GET ${API_BASE}/content/admin/stats
Authorization: Bearer {admin_or_teacher_token}

Response (200):
{
  "total_courses": 25,
  "total_students": 1250,
  "total_videos": 180,
  "total_revenue": 15750.50,
  "active_students_today": 45,
  "new_enrollments_this_week": 23
}
```

```http
GET ${API_BASE}/content/admin/stats/courses
Authorization: Bearer {admin_or_teacher_token}

Response (200):
{
  "total_courses": 25,
  "published_courses": 20,
  "draft_courses": 5,
  "courses_by_category": {
    "programming": 15,
    "design": 7,
    "business": 3
  }
}
```

```http
GET ${API_BASE}/content/admin/stats/students
Authorization: Bearer {admin_or_teacher_token}

Response (200):
{
  "total_students": 1250,
  "active_students": 850,
  "new_students_this_month": 45,
  "completion_rate": 78.5
}
```

```http
GET ${API_BASE}/content/admin/stats/videos
Authorization: Bearer {admin_or_teacher_token}

Response (200):
{
  "total_videos": 180,
  "total_watch_time": "15240 hours",
  "most_watched_video": {
    "id": "uuid",
    "title": "Introduction to React",
    "views": 1250
  }
}
```

```http
GET ${API_BASE}/content/admin/stats/revenue
Authorization: Bearer {admin_token}

Response (200):
{
  "total_revenue": 15750.50,
  "monthly_revenue": 2340.75,
  "revenue_by_course": [
    {
      "course_id": "uuid",
      "course_name": "React Masterclass",
      "revenue": 5200.00,
      "enrollments": 52
    }
  ]
}
```

---

## 🎬 **3. Video & Content Management (via API Gateway)**

### **Vimeo Integration**

```http
POST ${API_BASE}/content/vimeo/upload
Authorization: Bearer {admin_or_teacher_token}
Content-Type: application/json

Request Body:
{
  "name": "Lesson Video",
  "description": "Video description",
  "size": 1048576,
  "course_id": "uuid"
}

Response (201):
{
  "upload_link": "https://files.tus.vimeo.com/files/...",
  "complete_uri": "/videos/123456",
  "ticket_id": "ticket_123",
  "upload_id": "upload_456"
}
```

```http
PUT ${API_BASE}/content/vimeo/update-metadata/{video_id}
Authorization: Bearer {admin_or_teacher_token}
Content-Type: application/json

Request Body:
{
  "name": "Updated Video Title",
  "description": "Updated description",
  "privacy": "disable"
}

Response (200):
{
  "message": "Video metadata updated successfully",
  "video": {...}
}
```

```http
DELETE ${API_BASE}/content/vimeo/delete/{video_id}
Authorization: Bearer {admin_or_teacher_token}

Response (200):
{
  "message": "Video deleted successfully"
}
```

### **Video Analytics**

```http
GET ${API_BASE}/content/videos/course/{course_id}
Authorization: Bearer {token}

Response (200):
{
  "videos": [
    {
      "id": "uuid",
      "title": "Video Title",
      "vimeo_id": "123456",
      "duration": 1800,
      "views": 245,
      "completion_rate": 85.5
    }
  ]
}
```

```http
GET ${API_BASE}/content/videos/{video_id}/analytics
Authorization: Bearer {admin_or_teacher_token}

Response (200):
{
  "total_views": 245,
  "unique_viewers": 180,
  "completion_rate": 85.5,
  "average_watch_time": 1530,
  "drop_off_points": [300, 900, 1400]
}
```

```http
POST ${API_BASE}/content/videos/{video_id}/watch-progress
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "progress_seconds": 900,
  "total_duration": 1800,
  "completed": false
}

Response (200):
{
  "message": "Watch progress recorded"
}
```

---

## 📝 **4. Assignment System (Teacher Features)**

### **Assignment Management**

```http
GET ${API_BASE}/content/teacher/assignments
Authorization: Bearer {teacher_token}

Response (200):
{
  "assignments": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "title": "React Project",
      "description": "Build a React application",
      "due_date": "2024-01-15T23:59:59Z",
      "max_score": 100,
      "submissions_count": 15,
      "graded_count": 8
    }
  ]
}
```

```http
POST ${API_BASE}/content/teacher/assignments
Authorization: Bearer {teacher_token}
Content-Type: application/json

Request Body:
{
  "course_id": "uuid",
  "title": "React Project",
  "description": "Build a React application",
  "due_date": "2024-01-15T23:59:59Z",
  "max_score": 100
}

Response (201):
{
  "id": "uuid",
  "message": "Assignment created successfully",
  "assignment": {...}
}
```

```http
GET ${API_BASE}/content/teacher/students
Authorization: Bearer {teacher_token}

Response (200):
{
  "students": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "enrolled_courses": 3,
      "total_progress": 65.5,
      "last_activity": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🔧 **5. Database Schema Requirements**

### **Authentication Service Database**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    refresh_token VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Course Service Database**

```sql
-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10,2),
    instructor_id UUID,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    video_type VARCHAR(50),
    vimeo_id VARCHAR(100),
    duration INTEGER,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    course_id UUID REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE(user_id, course_id)
);

-- User lesson progress
CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    lesson_id UUID REFERENCES lessons(id),
    completed BOOLEAN DEFAULT false,
    score INTEGER,
    video_watched BOOLEAN DEFAULT false,
    watch_time_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    teacher_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id),
    student_id UUID,
    content TEXT,
    file_url VARCHAR(500),
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    graded_at TIMESTAMP
);
```

---

## 🔐 **6. Security & Authentication Requirements**

### **JWT Token Structure**

```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "student|teacher|admin",
  "roles": ["student"],
  "exp": 1609459200,
  "iat": 1609372800
}
```

### **Role-Based Access Control**

- **Students**: Can enroll in courses, track progress, submit assignments
- **Teachers**: Can manage their courses, create assignments, view student progress
- **Admins**: Full access to all features, user management, platform statistics

### **CORS Configuration**

```
Allowed Origins: http://localhost:5173, https://yourdomain.com
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Authorization, Content-Type
```

### **API Gateway Configuration**

Your API Gateway should route requests as follows:

```
# API Gateway Routes (localhost:8000)
/api/v1/login           → auth-service:3001/api/v1/login
/api/v1/register        → auth-service:3001/api/v1/register
/api/v1/refresh         → auth-service:3001/api/v1/refresh
/api/v1/users/*         → auth-service:3001/api/v1/users/*
/api/v1/admin/users/*   → auth-service:3001/api/v1/admin/users/*

/api/v1/content/*       → content-service:3002/api/v1/*
```

---

## 📊 **7. Error Response Format**

### **Standard Error Response**

```json
{
  "detail": "Error message",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Validation Error Response**

```json
{
  "detail": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "error_code": "VALIDATION_ERROR",
  "status_code": 422
}
```

---

## 🚀 **8. Implementation Priority**

### **Phase 1 (Week 1): Critical Authentication**

1. Token refresh endpoint
2. Admin user management endpoints
3. Profile management

### **Phase 2 (Week 2): Course Management**

1. Admin statistics endpoints
2. Course CRUD operations
3. Lesson management

### **Phase 3 (Week 3): Teacher Features**

1. Assignment system
2. Student progress viewing
3. Teacher-specific dashboards

### **Phase 4 (Week 4): Advanced Features**

1. Video analytics
2. Advanced reporting
3. Payment integration

This documentation provides everything yo u need to implement your backend services to work seamlessly with your existing frontend.
