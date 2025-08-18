# Error Resolution & Troubleshooting Guide

## 🚨 **Common Backend Implementation Issues**

### **1. Authentication Service Issues**

#### **Token Refresh Problems**

**Error**: Frontend shows "Token expired" or infinite login loops
**Cause**: Missing or incorrect refresh token implementation
**Solution**:

```
- Implement /api/v1/refresh endpoint
- Ensure refresh tokens are stored securely
- Set proper token expiration times (access: 15min, refresh: 7 days)
- Frontend should automatically refresh tokens on 401 responses
```

#### **Google OAuth Issues**

**Error**: "OAuth login failed" or invalid credential responses
**Cause**: Misconfigured Google OAuth settings
**Solution**:

```
- Verify Google Client ID in .env matches Google Console
- Ensure backend validates Google JWT tokens properly
- Check allowed origins in Google Console settings
- Implement proper user creation flow for OAuth users
```

#### **Role-Based Access Issues**

**Error**: "Access denied" for admin/teacher features
**Cause**: Inconsistent role handling between frontend and backend
**Solution**:

```
- Ensure JWT tokens contain both 'role' and 'roles' fields
- Backend should accept both formats for compatibility
- Validate roles on every protected endpoint
- Use consistent role names: 'admin', 'teacher', 'student'
```

---

### **2. Course Management Service Issues**

#### **Dashboard Statistics Loading**

**Error**: Admin dashboard shows "0" for all statistics
**Cause**: Missing /admin/stats endpoints
**Solution**:

```
- Implement all statistics endpoints:
  - GET /admin/stats (overview)
  - GET /admin/stats/courses
  - GET /admin/stats/students
  - GET /admin/stats/videos
- Return proper JSON format with numeric values
- Add error handling for database queries
```

#### **Course CRUD Operations**

**Error**: "Coming Soon" pages instead of actual functionality
**Cause**: Missing admin course management endpoints
**Solution**:

```
- Implement POST /admin/courses (create)
- Implement PUT /admin/courses/{id} (update)
- Implement DELETE /admin/courses/{id} (delete)
- Add proper validation for course data
- Handle file uploads for course images
```

#### **Student Enrollment Issues**

**Error**: Students can't enroll or see progress
**Cause**: Missing enrollment and progress tracking
**Solution**:

```
- Implement POST /courses/{id}/enroll
- Implement GET /courses/my-courses
- Fix progress tracking in /user-lesson-progress endpoints
- Add enrollment validation (prevent duplicate enrollments)
```

---

### **3. Video & Content Issues**

#### **Vimeo Upload Problems**

**Error**: Video upload fails or doesn't save to database
**Cause**: Incomplete Vimeo integration
**Solution**:

```
- Configure Vimeo API credentials properly
- Implement complete upload workflow:
  1. Create upload URL
  2. Upload video to Vimeo
  3. Save video metadata to database
  4. Link video to lesson
- Add proper error handling for network issues
```

#### **Video Progress Tracking**

**Error**: Video progress not saving or loading
**Cause**: Missing progress tracking endpoints
**Solution**:

```
- Implement POST /videos/{id}/watch-progress
- Update lesson progress when video is completed
- Add validation for progress data (0-100%)
- Store watch time and completion status
```

---

### **4. Database Issues**

#### **Foreign Key Constraints**

**Error**: Database errors when creating related records
**Cause**: Missing or incorrect foreign key relationships
**Solution**:

```
- Ensure user_id exists before creating enrollments
- Validate course_id before creating lessons
- Use UUIDs consistently across all tables
- Add proper cascade deletion rules
```

#### **Data Type Mismatches**

**Error**: "Invalid data type" errors
**Cause**: Frontend sends different data types than backend expects
**Solution**:

```
- Use consistent data types:
  - IDs: UUID strings
  - Timestamps: ISO 8601 format
  - Numbers: Integers for counts, Decimals for money
  - Booleans: true/false (not 1/0)
```

---

### **5. CORS and Security Issues**

#### **CORS Errors**

**Error**: "Access blocked by CORS policy"
**Cause**: Incorrect CORS configuration
**Solution**:

```
- Allow frontend origin: http://localhost:5173
- Allow required headers: Authorization, Content-Type
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Handle preflight requests properly
```

#### **Authorization Issues**

**Error**: "401 Unauthorized" on protected routes
**Cause**: Missing or incorrect JWT validation
**Solution**:

```
- Verify JWT signature with correct secret
- Check token expiration
- Extract user info from token properly
- Validate user roles for protected endpoints
```

---

### **6. Performance Issues**

#### **Slow Dashboard Loading**

**Error**: Dashboard takes too long to load statistics
**Cause**: Inefficient database queries
**Solution**:

```
- Add database indexes on frequently queried fields
- Use aggregation queries for statistics
- Implement caching for dashboard data
- Paginate large result sets
```

#### **Large Course Data**

**Error**: Timeout when loading courses with many lessons
**Cause**: Loading too much data at once
**Solution**:

```
- Implement pagination for course lists
- Load lesson details on demand
- Use database joins efficiently
- Consider caching course data
```

---

## 🔧 **Debugging Steps**

### **1. API Request/Response Debugging**

```bash
# Check if services are running
curl https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/health
curl http://localhost:8080/health

# Test authentication
curl -X POST https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot_de_passe":"password"}'

# Test protected endpoints
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/admin/stats
```

### **2. Database Debugging**

```sql
-- Check user data
SELECT id, email, role FROM users WHERE email = 'test@example.com';

-- Check course enrollment
SELECT ce.*, u.email, c.name
FROM course_enrollments ce
JOIN users u ON ce.user_id = u.id
JOIN courses c ON ce.course_id = c.id;

-- Check progress data
SELECT ulp.*, l.title
FROM user_lesson_progress ulp
JOIN lessons l ON ulp.lesson_id = l.id
WHERE ulp.user_id = 'USER_UUID';
```

### **3. Frontend Error Debugging**

```javascript
// Check localStorage for tokens
console.log('Access Token:', localStorage.getItem('access_token'));

// Debug JWT token content
import { jwtDecode } from 'jwt-decode';
const token = localStorage.getItem('access_token');
console.log('Decoded Token:', jwtDecode(token));

// Monitor API calls
// Open browser DevTools -> Network tab -> Filter by XHR
```

---

## 📋 **Validation Checklist**

### **Authentication Service**

- [ ] Users can register and login
- [ ] Google OAuth works
- [ ] JWT tokens contain correct user info
- [ ] Token refresh works automatically
- [ ] Admin can manage users
- [ ] Role-based access control works

### **Course Management Service**

- [ ] Course listing works
- [ ] Course details load properly
- [ ] Admin can create/edit courses
- [ ] Student enrollment works
- [ ] Progress tracking saves correctly
- [ ] Dashboard statistics load

### **Video Service**

- [ ] Videos upload to Vimeo
- [ ] Video metadata saves to database
- [ ] Video progress tracking works
- [ ] Video analytics display

### **Teacher Features**

- [ ] Teachers can create assignments
- [ ] Teachers can view student progress
- [ ] Assignment submissions work
- [ ] Grading system functions

---

## 🚨 **Emergency Fixes**

### **If Dashboard Shows All Zeros**

```python
# Quick test endpoint to verify database connection
@app.get("/admin/stats/test")
async def test_stats():
    return {
        "total_courses": 10,  # hardcoded for testing
        "total_students": 100,
        "total_videos": 50,
        "total_revenue": 5000
    }
```

### **If Authentication Completely Broken**

```python
# Temporary bypass for testing (REMOVE IN PRODUCTION)
@app.get("/debug/create-admin")
async def create_admin():
    # Create admin user with known credentials
    # Use only for initial testing
```

### **If Frontend Can't Connect**

```python
# Add health check endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth-service"}

@app.get("/api/v1/health")
async def api_health():
    return {"status": "healthy", "timestamp": datetime.now()}
```

---

## 📞 **Support Checklist**

When asking for help, provide:

1. **Error message** (exact text)
2. **Request/Response** (from browser DevTools)
3. **Database logs** (if applicable)
4. **Service logs** (backend console output)
5. **Configuration** (.env values - without secrets)
6. **Steps to reproduce** the issue

---

## 🔄 **Common Fixes Summary**

| Issue                 | Quick Fix                             |
| --------------------- | ------------------------------------- |
| Dashboard shows zeros | Implement `/admin/stats` endpoints    |
| "Coming Soon" pages   | Implement CRUD endpoints for courses  |
| Login loop            | Implement token refresh endpoint      |
| CORS errors           | Configure CORS properly in backend    |
| 401 errors            | Check JWT validation and roles        |
| Video upload fails    | Configure Vimeo API credentials       |
| Progress not saving   | Implement progress tracking endpoints |
| Admin access denied   | Verify role-based authorization       |

This guide should help you identify and resolve most backend implementation issues quickly.
