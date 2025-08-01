import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard = () => {
  console.log('🚀 AdminDashboard component is loading...');

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalVideos: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  console.log('------------------------------');
  console.log('Token from localStorage:', token);
  console.log('------------------------------');

  let user = null;
  let userRoles = [];
  try {
    if (token) {
      user = jwtDecode(token);
      // Handle both 'role' (string) and 'roles' (array) formats
      userRoles = user.roles || (user.role ? [user.role] : []);
      console.log('Decoded user:', user);
      console.log('User roles:', userRoles);
    } else {
      console.log('No token found in localStorage');
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    console.log('Invalid token, removing from localStorage');
    localStorage.removeItem('access_token');
  }

  console.log('------------------------------');
  console.log('Final User object:', user);
  console.log('------------------------------');

  // Check if user is admin or teacher
  useEffect(() => {
    console.log('useEffect triggered');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User roles:', userRoles);

    const hasAccess =
      userRoles.includes('admin') || userRoles.includes('teacher');

    if (!token || !user || !hasAccess) {
      console.log('Access denied, redirecting to home');
      console.log(
        'Reason: token=',
        !!token,
        'user=',
        !!user,
        'roles=',
        userRoles
      );
      navigate('/');
      return;
    }

    console.log('Access granted, loading dashboard stats');
    // Load dashboard stats
    loadDashboardStats();
  }, [token, user, userRoles, navigate]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard stats...');

      // Load courses count from existing endpoint
      const coursesResponse = await fetch(
        'http://localhost:8000/api/v1/content/modules/full',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Load user progress to count students
      const studentsResponse = await fetch(
        'http://localhost:8000/api/v1/content/user-lesson-progress/all',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let totalCourses = 0;
      let totalStudents = 0;
      let totalVideos = 0;

      // Count courses
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        totalCourses = Array.isArray(coursesData) ? coursesData.length : 0;

        // Count videos/lessons from all courses
        totalVideos = coursesData.reduce((count, course) => {
          return count + (course.lessons ? course.lessons.length : 0);
        }, 0);
      }

      // Count unique students and prepare recent activities
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        if (Array.isArray(studentsData)) {
          const uniqueStudents = new Set(
            studentsData.map((record) => record.user_id)
          );
          totalStudents = uniqueStudents.size;

          // Get recent activities (last 10 completed lessons)
          const recentCompletions = studentsData
            .filter((record) => record.completed)
            .sort(
              (a, b) =>
                new Date(b.completed_at || b.created_at) -
                new Date(a.completed_at || a.created_at)
            )
            .slice(0, 10)
            .map((record) => ({
              id: record.id,
              type: 'lesson_completed',
              message: `Student completed lesson ${record.lesson_id}`,
              time: record.completed_at || record.created_at,
              user_id: record.user_id,
            }));

          setRecentActivities(recentCompletions);
        }
      }

      console.log('Stats loaded:', {
        totalCourses,
        totalStudents,
        totalVideos,
      });

      setStats({
        totalCourses,
        totalStudents,
        totalVideos,
        totalRevenue: 0, // Revenue will be implemented later
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Set fallback values
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        totalVideos: 0,
        totalRevenue: 0,
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess =
    userRoles.includes('admin') || userRoles.includes('teacher');

  if (!user || !hasAccess) {
    return <div>Access denied. Admin or Teacher access only.</div>;
  }

  // Check user permissions
  const isAdmin = userRoles.includes('admin');
  const isTeacher = userRoles.includes('teacher');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Admin Dashboard' : 'Teacher Dashboard'}
              </h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAdmin
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isAdmin ? 'Administrator' : 'Teacher'}
                </span>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadDashboardStats}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Courses Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Courses
                </p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalCourses.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalStudents.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Total Videos Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Videos
                </p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalVideos.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  <span className="text-sm text-gray-400">Coming Soon</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Upload Video - Both admin and teacher */}
                  <Link
                    to="/admin/video-upload"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 4v16l13-8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Upload Video</p>
                      <p className="text-sm text-gray-500">Add to Vimeo</p>
                    </div>
                  </Link>

                  {/* Manage Courses - Different access levels */}
                  <Link
                    to="/admin/courses"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Manage Courses
                      </p>
                      <p className="text-sm text-gray-500">
                        {isAdmin ? 'Edit existing' : 'View your courses'}
                      </p>
                    </div>
                  </Link>

                  {/* Manage Users - Admin only */}
                  {isAdmin && (
                    <Link
                      to="/admin/users"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-6 h-6 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Manage Users
                        </p>
                        <p className="text-sm text-gray-500">
                          Students & Teachers
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* Teacher specific actions */}
                  {isTeacher && (
                    <Link
                      to="/teacher/students"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-6 h-6 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">My Students</p>
                        <p className="text-sm text-gray-500">
                          View student progress
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div
                      key={activity.id || index}
                      className="flex items-center"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activity.time
                            ? new Date(activity.time).toLocaleDateString()
                            : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
