import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../../config/api';
import UserDetailsModal from './UserDetailsModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    semester: 'S1',
  });

  const semesters = [
    { value: 'S1', label: 'Semester 1 (S1)' },
    { value: 'S2', label: 'Semester 2 (S2)' },
    { value: 'S3', label: 'Semester 3 (S3)' },
    { value: 'S4', label: 'Semester 4 (S4)' },
  ];

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const roles =
          decodedUser.roles || (decodedUser.role ? [decodedUser.role] : []);
        setIsAdmin(roles.includes('admin'));
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(API_CONFIG.ADMIN.USERS.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the actual API response structure
        const users = data.users || [];
        // Map the API fields to our component fields
        const mappedUsers = users.map((user) => ({
          id: user.id,
          email: user.email,
          // Map nom_utilisateur to first_name for display
          first_name: user.nom_utilisateur || '',
          last_name: '', // Not provided by API
          roles: user.roles || [],
          role: user.roles?.length > 0 ? user.roles[0].nom : 'student',
          semester: user.semester || 'S1', // Default to S1 if not specified
          statut_compte: user.statut_compte,
          is_verified: user.is_verified,
        }));
        setUsers(mappedUsers);
      } else {
        console.error('Failed to fetch users:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'student',
      semester: 'S1',
    });
    setSelectedUser(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleUserCardClick = (user) => {
    setSelectedUserDetails(user);
    setShowDetailsModal(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setSuccessMessage('User updated successfully!');
  };

  const handleUserDelete = (userToDelete) => {
    handleDeleteUser(userToDelete);
  };

  const handleAddUser = () => {
    resetForm();
    setModalType('add');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      email: user.email || '',
      password: '',
      first_name: user.first_name || user.nom_utilisateur || '',
      last_name: user.last_name || '',
      role:
        user.role || (user.roles?.length > 0 ? user.roles[0].nom : 'student'),
      semester: user.semester || 'S1',
    });
    setSelectedUser(user);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const url =
        modalType === 'add'
          ? API_CONFIG.AUTH.REGISTER
          : API_CONFIG.ADMIN.USERS.GET_BY_ID(selectedUser.id);

      const method = modalType === 'add' ? 'POST' : 'PUT';

      const body = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        ...(formData.role === 'student' && { semester: formData.semester }),
      };

      if (modalType === 'add' || formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSuccessMessage(
          `User ${modalType === 'add' ? 'created' : 'updated'} successfully!`
        );
        setShowModal(false);
        loadUsers();
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || `Failed to ${modalType} user`);
      }
    } catch (error) {
      console.error(`Error ${modalType}ing user:`, error);
      setErrorMessage(`Error ${modalType}ing user. Please try again.`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const userName = user.first_name || user.nom_utilisateur || user.email;
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_CONFIG.ADMIN.USERS.DELETE(user.id), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccessMessage('User deleted successfully!');
        loadUsers();
      } else {
        setErrorMessage('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('Error deleting user. Please try again.');
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Handle the actual API role structure
    const userRole =
      user.role || (user.roles?.length > 0 ? user.roles[0].nom : 'user');
    const matchesTab =
      activeTab === 'students'
        ? userRole === 'user' || user.roles?.length === 0 // Users with no roles are treated as students
        : userRole === 'teacher';
    const matchesSearch =
      !searchTerm ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      semesterFilter === 'all' || user.semester === semesterFilter;

    return (
      matchesTab &&
      matchesSearch &&
      (activeTab === 'teachers' || matchesSemester)
    );
  });

  // Group students by semester
  const studentsBySemester =
    activeTab === 'students'
      ? semesters.reduce((acc, sem) => {
          acc[sem.value] = filteredUsers.filter(
            (user) => user.semester === sem.value
          );
          return acc;
        }, {})
      : {};

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Admin access required to view this page.
          </p>
          <Link
            to="/admin/dashboard"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link
              to="/admin/dashboard"
              className="hover:text-blue-600 transition-colors"
            >
              Admin Dashboard
            </Link>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-900 font-medium">User Management</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage students and teachers across all semesters
              </p>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 lg:mt-0 flex space-x-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                    <p className="text-sm font-medium text-gray-900">
                      {
                        users.filter(
                          (u) => u.role === 'student' || u.roles?.length === 0
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {users.filter((u) => u.role === 'teacher').length}
                    </p>
                    <p className="text-xs text-gray-500">Teachers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-green-800 font-medium">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage('')}
                className="ml-auto text-green-600 hover:text-green-800"
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
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-800 font-medium">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage('')}
                className="ml-auto text-red-600 hover:text-red-800"
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
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab('students')}
                className={`relative py-4 px-6 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'students'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm rounded-t-lg -mb-px'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
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
                  <span>Students</span>
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {
                      users.filter(
                        (u) => u.role === 'student' || u.roles?.length === 0
                      ).length
                    }
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`relative py-4 px-6 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'teachers'
                    ? 'text-purple-600 bg-white border-b-2 border-purple-600 shadow-sm rounded-t-lg -mb-px'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>Teachers</span>
                  <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {users.filter((u) => u.role === 'teacher').length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Controls */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                  />
                  <svg
                    className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Semester Filter */}
                {activeTab === 'students' && (
                  <div className="relative">
                    <select
                      value={semesterFilter}
                      onChange={(e) => setSemesterFilter(e.target.value)}
                      className="appearance-none bg-white pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                    >
                      <option value="all">All Semesters</option>
                      {semesters.map((sem) => (
                        <option key={sem.value} value={sem.value}>
                          {sem.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
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
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={loadUsers}
                  disabled={loading}
                  className="flex items-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
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
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add {activeTab === 'students' ? 'Student' : 'Teacher'}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : activeTab === 'students' ? (
              /* Students grouped by semester */
              <div className="space-y-8">
                {semesters.map((semester) => {
                  const semesterStudents =
                    studentsBySemester[semester.value] || [];

                  if (
                    semesterFilter !== 'all' &&
                    semesterFilter !== semester.value
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={semester.value}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {semester.value}
                            </span>
                          </div>
                          {semester.label}
                        </h3>
                        <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-sm">
                          {semesterStudents.length} students
                        </span>
                      </div>

                      {semesterStudents.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {semesterStudents.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => handleUserCardClick(student)}
                              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {student.first_name?.[0] ||
                                        student.nom_utilisateur?.[0] ||
                                        'U'}
                                      {student.last_name?.[0] ||
                                        student.nom_utilisateur?.[1] ||
                                        ''}
                                    </span>
                                  </div>
                                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditUser(student);
                                      }}
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                      title="Edit student"
                                    >
                                      <svg
                                        className="w-4 h-4"
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
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUser(student);
                                      }}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                      title="Delete student"
                                    >
                                      <svg
                                        className="w-4 h-4"
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
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {student.first_name ||
                                      student.nom_utilisateur ||
                                      'Unknown User'}
                                  </h4>
                                  <p
                                    className="text-sm text-gray-500 mb-3 truncate"
                                    title={student.email}
                                  >
                                    {student.email}
                                  </p>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                    </svg>
                                    Student
                                  </span>
                                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span className="text-xs text-blue-600 flex items-center">
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      Click for details
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
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
                          <p className="text-gray-500 text-lg">
                            No students in {semester.label}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Students will appear here once added
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Teachers list */
              <div>
                {filteredUsers.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredUsers.map((teacher) => (
                      <div
                        key={teacher.id}
                        onClick={() => handleUserCardClick(teacher)}
                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {teacher.first_name?.[0] ||
                                  teacher.nom_utilisateur?.[0] ||
                                  'U'}
                                {teacher.last_name?.[0] ||
                                  teacher.nom_utilisateur?.[1] ||
                                  ''}
                              </span>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUser(teacher);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                title="Edit teacher"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(teacher);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete teacher"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {teacher.first_name ||
                                teacher.nom_utilisateur ||
                                'Unknown User'}
                            </h4>
                            <p
                              className="text-sm text-gray-500 mb-3 truncate"
                              title={teacher.email}
                            >
                              {teacher.email}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              Teacher
                            </span>
                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <span className="text-xs text-purple-600 flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Click for details
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No teachers found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Teachers will appear here once added
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal for Add/Edit User */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowModal(false)}
              ></div>

              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {modalType === 'add' ? 'Add New User' : 'Edit User'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
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

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter email address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password{' '}
                          {modalType === 'edit' &&
                            '(leave empty to keep current)'}
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={modalType === 'add'}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder={
                            modalType === 'add'
                              ? 'Enter password'
                              : 'Enter new password (optional)'
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                          </select>
                        </div>

                        {formData.role === 'student' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Semester
                            </label>
                            <select
                              name="semester"
                              value={formData.semester}
                              onChange={handleInputChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              {semesters.map((sem) => (
                                <option key={sem.value} value={sem.value}>
                                  {sem.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all sm:mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {submitLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {modalType === 'add' ? 'Creating...' : 'Updating...'}
                        </div>
                      ) : modalType === 'add' ? (
                        'Create User'
                      ) : (
                        'Update User'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        <UserDetailsModal
          user={selectedUserDetails}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={handleUserUpdate}
          onDelete={handleUserDelete}
        />
      </div>
    </div>
  );
};

export default UserManagement;
