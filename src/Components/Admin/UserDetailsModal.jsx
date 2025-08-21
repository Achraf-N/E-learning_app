import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../config/api';

const UserDetailsModal = ({ user, isOpen, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userCourses, setUserCourses] = useState([]);
  const [userModuleProgress, setUserModuleProgress] = useState([]);
  const [userLessonProgress, setUserLessonProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const semesters = [
    { value: 'S1', label: 'Semester 1' },
    { value: 'S2', label: 'Semester 2' },
    { value: 'S3', label: 'Semester 3' },
    { value: 'S4', label: 'Semester 4' },
  ];

  useEffect(() => {
    if (isOpen && user) {
      setEditForm({
        email: user.email || '',
        nom_utilisateur: user.first_name || user.nom_utilisateur || '',
        role:
          user.role || (user.roles?.length > 0 ? user.roles[0].nom : 'student'),
        semester: user.semester || 'S1',
        statut_compte: user.statut_compte || 'ACTIF',
      });

      if (user.role === 'student' || user.roles?.length === 0) {
        loadUserCourses();
        loadUserModuleProgress();
        loadUserLessonProgress();
      }
    }
  }, [isOpen, user]);

  const loadUserCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Mock API call - replace with actual endpoint
      const response = await fetch(
        `${API_CONFIG.PROGRESS.GET_ALL}?user_id=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error loading user courses:', error);
      // Mock data for demonstration
      setUserCourses([
        {
          id: 1,
          title: 'Mathematics Advanced',
          progress: 85,
          grade: 'A',
          status: 'In Progress',
        },
        {
          id: 2,
          title: 'Physics Fundamentals',
          progress: 92,
          grade: 'A+',
          status: 'Completed',
        },
        {
          id: 3,
          title: 'Chemistry Basics',
          progress: 67,
          grade: 'B',
          status: 'In Progress',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserModuleProgress = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        API_CONFIG.MODULE_PROGRESS.GET_BY_USER(user.id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserModuleProgress(data.progress || data || []);
      }
    } catch (error) {
      console.error('Error loading user module progress:', error);
      // Mock data for demonstration
      setUserModuleProgress([
        {
          id: 1,
          module_id: 1,
          module_title: 'Mathematics Advanced',
          is_module_unlocked: true,
          progress_percentage: 85,
          completed_lessons: 12,
          total_lessons: 15,
          last_accessed: '2025-08-20',
          exam_passed: true,
          exam_score: 88,
        },
        {
          id: 2,
          module_id: 2,
          module_title: 'Physics Fundamentals',
          is_module_unlocked: false,
          progress_percentage: 0,
          completed_lessons: 0,
          total_lessons: 10,
          last_accessed: null,
          exam_passed: false,
          exam_score: null,
        },
      ]);
    }
  };

  const loadUserLessonProgress = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `${API_CONFIG.PROGRESS.GET_ALL}?user_id=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserLessonProgress(data.progress || []);
      }
    } catch (error) {
      console.error('Error loading user lesson progress:', error);
      // Mock data for demonstration
      setUserLessonProgress([
        {
          lesson_id: 1,
          lesson_title: 'Calculus Introduction',
          completed: true,
          score: 95,
          date: '2025-08-15',
        },
        {
          lesson_id: 2,
          lesson_title: 'Linear Algebra',
          completed: true,
          score: 88,
          date: '2025-08-18',
        },
        {
          lesson_id: 3,
          lesson_title: 'Differential Equations',
          completed: false,
          score: null,
          date: null,
        },
      ]);
    }
  };

  const createModuleProgress = async (moduleId) => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(API_CONFIG.MODULE_PROGRESS.CREATE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module_id: moduleId,
          is_module_unlocked: false, // Start as locked
        }),
      });

      if (response.ok) {
        const data = await response.json();
        loadUserModuleProgress(); // Refresh the progress data
        return data;
      }
    } catch (error) {
      console.error('Error creating module progress:', error);
    }
  };

  const unlockModule = async (progressId) => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        API_CONFIG.MODULE_PROGRESS.UPDATE(progressId),
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_module_unlocked: true,
          }),
        }
      );

      if (response.ok) {
        loadUserModuleProgress(); // Refresh the progress data
        return true;
      }
    } catch (error) {
      console.error('Error unlocking module:', error);
    }
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(API_CONFIG.ADMIN.USERS.GET_BY_ID(user.id), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUpdate(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteUser = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${
          user.first_name || user.nom_utilisateur
        }?`
      )
    ) {
      onDelete(user);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const userRole =
    user.role || (user.roles?.length > 0 ? user.roles[0].nom : 'student');
  const isStudent = userRole === 'student' || user.roles?.length === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    userRole === 'teacher' ? 'bg-purple-500' : 'bg-green-500'
                  }`}
                >
                  <span className="text-white font-bold text-xl">
                    {user.first_name?.[0] || user.nom_utilisateur?.[0] || 'U'}
                    {user.last_name?.[0] || user.nom_utilisateur?.[1] || ''}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {user.first_name || user.nom_utilisateur || 'Unknown User'}
                  </h2>
                  <p className="text-blue-100">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userRole === 'teacher'
                          ? 'bg-purple-100 text-purple-800'
                          : userRole === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </span>
                    {isStudent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.semester || 'S1'}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.statut_compte === 'ACTIF'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.statut_compte || 'ACTIF'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all"
                    >
                      <svg
                        className="w-4 h-4 inline mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="bg-red-500 bg-opacity-80 text-white px-4 py-2 rounded-lg hover:bg-opacity-100 transition-all"
                    >
                      <svg
                        className="w-4 h-4 inline mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      disabled={submitLoading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {submitLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-300 p-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                {isStudent && (
                  <>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'courses'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Courses & Grades
                    </button>
                    <button
                      onClick={() => setActiveTab('progress')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'progress'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Learning Progress
                    </button>
                  </>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="nom_utilisateur"
                          value={editForm.nom_utilisateur}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={editForm.role}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      {editForm.role === 'student' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Semester
                          </label>
                          <select
                            name="semester"
                            value={editForm.semester}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {semesters.map((sem) => (
                              <option key={sem.value} value={sem.value}>
                                {sem.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Status
                        </label>
                        <select
                          name="statut_compte"
                          value={editForm.statut_compte}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="ACTIF">Active</option>
                          <option value="INACTIF">Inactive</option>
                          <option value="SUSPENDU">Suspended</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            User Information
                          </h3>
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                User ID
                              </dt>
                              <dd className="text-sm text-gray-900">
                                #{user.id}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                Username
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {user.first_name || user.nom_utilisateur}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                Email
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {user.email}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                Email Verified
                              </dt>
                              <dd
                                className={`text-sm ${
                                  user.is_verified
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {user.is_verified ? 'Verified' : 'Not Verified'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Account Details
                          </h3>
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                Role
                              </dt>
                              <dd className="text-sm text-gray-900 capitalize">
                                {userRole}
                              </dd>
                            </div>
                            {isStudent && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">
                                  Semester
                                </dt>
                                <dd className="text-sm text-gray-900">
                                  {user.semester || 'S1'}
                                </dd>
                              </div>
                            )}
                            <div>
                              <dt className="text-sm font-medium text-gray-500">
                                Account Status
                              </dt>
                              <dd
                                className={`text-sm ${
                                  user.statut_compte === 'ACTIF'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {user.statut_compte || 'ACTIF'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'courses' && isStudent && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Enrolled Courses
                  </h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-gray-600 mt-2">Loading courses...</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {userCourses.map((course) => (
                        <div
                          key={course.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {course.title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                course.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {course.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 mb-1">
                                  Progress
                                </div>
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${course.progress}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {course.progress}%
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Grade</div>
                              <div
                                className={`font-semibold ${
                                  course.grade?.startsWith('A')
                                    ? 'text-green-600'
                                    : course.grade?.startsWith('B')
                                    ? 'text-blue-600'
                                    : 'text-yellow-600'
                                }`}
                              >
                                {course.grade || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userCourses.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No courses enrolled yet
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'progress' && isStudent && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Module Progress
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userModuleProgress.length > 0 ? (
                        userModuleProgress.map((progress) => (
                          <div
                            key={progress.id}
                            className="bg-gray-50 p-4 rounded-lg border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-800">
                                Module {progress.module_id}
                              </h5>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  progress.is_module_unlocked
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {progress.is_module_unlocked
                                  ? 'Unlocked'
                                  : 'Locked'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${progress.progress_percentage}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {progress.progress_percentage}% Complete
                            </div>
                            {progress.exam_passed !== null && (
                              <div className="mt-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    progress.exam_passed
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  Exam:{' '}
                                  {progress.exam_passed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                            )}
                            {!progress.is_module_unlocked && (
                              <button
                                onClick={() => unlockModule(progress.id)}
                                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              >
                                Unlock Module
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-2">
                          No module progress found
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Lesson Progress
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userLessonProgress.length > 0 ? (
                        userLessonProgress.map((progress) => (
                          <div
                            key={progress.id}
                            className="bg-gray-50 p-4 rounded-lg border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-800">
                                Lesson {progress.lesson_id}
                              </h5>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  progress.is_completed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {progress.is_completed
                                  ? 'Completed'
                                  : 'In Progress'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${progress.progress_percentage}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {progress.progress_percentage}% Complete
                            </div>
                            {progress.last_accessed && (
                              <div className="text-xs text-gray-500 mt-1">
                                Last accessed:{' '}
                                {new Date(
                                  progress.last_accessed
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-2">
                          No lesson progress found
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
