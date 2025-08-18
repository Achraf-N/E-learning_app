import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const VimeoUploader = () => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, completed, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    courseId: '',
    lessonOrder: 1,
    duration: '',
    vimeoId: '',
    vimeoUrl: '',
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  //const user = token ? jwtDecode(token) : null;
  const user = React.useMemo(() => (token ? jwtDecode(token) : null), [token]);

  // Handle both roles array and role string formats
  //const userRoles = user ? user.roles || (user.role ? [user.role] : []) : [];
  //const isAdmin = userRoles.includes('admin');
  //const isTeacher = userRoles.includes('teacher');

  const userRoles = React.useMemo(() => {
    if (!user) return [];
    return user.roles || (user.role ? [user.role] : []);
  }, [user]);

  const isAdmin = React.useMemo(() => userRoles.includes('admin'), [userRoles]);
  const isTeacher = React.useMemo(
    () => userRoles.includes('teacher'),
    [userRoles]
  );

  React.useEffect(() => {
    console.log('useEffect triggered');

    if (!token || !user || (!isAdmin && !isTeacher)) {
      navigate('/');
      return;
    }
    loadCourses();
  }, [token, user, navigate, isAdmin, isTeacher]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/content/modules/full',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const coursesData = await response.json();
        setCourses(coursesData);
      } else {
        setError('Failed to load courses. Please try again.');
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      setError('Failed to load courses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!videoData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!videoData.courseId) {
      errors.courseId = 'Please select a course';
    }

    if (!selectedFile) {
      errors.file = 'Please select a video file';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = (file) => {
    console.log('File type:', file.type);
    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/quicktime',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, AVI, MOV, WMV)');
      setValidationErrors((prev) => ({ ...prev, file: 'Invalid file type' }));
      return;
    }

    // Validate file size (max 2GB for better experience)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      setError('File size must be less than 2GB');
      setValidationErrors((prev) => ({ ...prev, file: 'File too large' }));
      return;
    }

    setError('');
    // Supprimer proprement la clé 'file' de validationErrors
    setValidationErrors((prev) => {
      const { file, ...rest } = prev; // enlève la clé 'file'
      return rest;
    });

    setSelectedFile(file);

    // Auto-fill title if empty
    if (!videoData.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setVideoData((prev) => ({ ...prev, title: fileName }));
    }
  };

  const startUpload = () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    uploadToVimeo(selectedFile);
  };

  const uploadToVimeo = async (file) => {
    setUploadState('uploading');
    setUploadProgress(0);
    setError('');

    try {
      // Step 1: Create upload ticket with Vimeo
      const uploadTicketResponse = await fetch(
        'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/content/vimeo/upload',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            size: file.size,
            name: videoData.title || file.name,
          }),
        }
      );

      if (!uploadTicketResponse.ok) {
        const errorData = await uploadTicketResponse.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 'Failed to create Vimeo upload ticket'
        );
      }

      const { upload_url, upload_ticket, video_id } =
        await uploadTicketResponse.json();

      // Step 2: Upload file to Vimeo using tus resumable upload
      const uploadResponse = await uploadFileToVimeo(
        file,
        upload_url,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (uploadResponse.ok) {
        setUploadState('processing');
        setUploadProgress(100);

        // Step 3: Update video metadata on Vimeo
        await updateVimeoMetadata(video_id);

        // Step 4: Save video data to your database
        await saveVideoToDatabase(video_id);

        setUploadState('completed');
        setSuccess(
          `Video "${videoData.title}" uploaded successfully! Processing may take a few minutes.`
        );

        // Reset form after successful upload
        resetForm();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
      setUploadState('error');
    }
  };

  const resetForm = () => {
    setVideoData({
      title: '',
      description: '',
      courseId: '',
      lessonOrder: 1,
      duration: '',
      vimeoId: '',
      vimeoUrl: '',
    });
    setSelectedFile(null);
    setValidationErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFileToVimeo = async (file, uploadUrl, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ok: true });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('PATCH', uploadUrl);
      xhr.setRequestHeader('Tus-Resumable', '1.0.0');
      xhr.setRequestHeader('Upload-Offset', '0');
      xhr.setRequestHeader('Content-Type', 'application/offset+octet-stream');

      xhr.send(file);
    });
  };

  const updateVimeoMetadata = async (videoId) => {
    await fetch(
      `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/content/vimeo/update-metadata/${videoId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: videoData.title,
          description: videoData.description,
        }),
      }
    );
  };

  const saveVideoToDatabase = async (videoId) => {
    const response = await fetch(
      'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/content/lessons',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: videoData.title,
          description: videoData.description,
          course_id: videoData.courseId,
          order_index: parseInt(videoData.lessonOrder),
          video_url: `https://vimeo.com/${videoId}`,
          vimeo_id: videoId,
          video_type: 'vimeo',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save lesson to database');
    }

    setVideoData((prev) => ({
      ...prev,
      vimeoId: videoId,
      vimeoUrl: `https://vimeo.com/${videoId}`,
    }));
  };

  if (!user || (!isAdmin && !isTeacher)) {
    return <div>Access denied. Admin or Teacher access only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Upload Video to Vimeo' : 'Upload Lesson Video'}
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? 'Upload lesson videos and automatically save to your course'
              : 'Upload your lesson videos to share with students'}
          </p>
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

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State for Courses */}
        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
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
            Loading courses...
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Video Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={videoData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.title
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Introduction to React Hooks"
                  disabled={
                    uploadState === 'uploading' || uploadState === 'processing'
                  }
                  required
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  name="courseId"
                  value={videoData.courseId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.courseId
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  disabled={
                    loading ||
                    uploadState === 'uploading' ||
                    uploadState === 'processing'
                  }
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {validationErrors.courseId && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.courseId}
                  </p>
                )}
              </div>

              {/* Lesson Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Order
                </label>
                <input
                  type="number"
                  name="lessonOrder"
                  value={videoData.lessonOrder}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={
                    uploadState === 'uploading' || uploadState === 'processing'
                  }
                />
              </div>

              {/* Duration (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (optional)
                </label>
                <input
                  type="text"
                  name="duration"
                  value={videoData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15 minutes"
                  disabled={
                    uploadState === 'uploading' || uploadState === 'processing'
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={videoData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what students will learn in this lesson..."
                disabled={
                  uploadState === 'uploading' || uploadState === 'processing'
                }
              />
            </div>

            {/* File Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File *
              </label>

              {/* Selected File Preview */}
              {selectedFile && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="w-8 h-8 text-blue-600 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {uploadState === 'idle' && (
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = '';
                        }}
                        className="text-red-600 hover:text-red-800"
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
                    )}
                  </div>
                </div>
              )}

              <div>
                <p>uploadState: {uploadState}</p>
                <p>selectedFile: {selectedFile ? selectedFile.name : 'none'}</p>
                <p>
                  validationErrors keys:{' '}
                  {Object.keys(validationErrors).join(', ') || 'none'}
                </p>
              </div>
              {/* Drop Zone */}
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : validationErrors.file
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${
                  uploadState === 'uploading' || uploadState === 'processing'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (uploadState === 'idle' && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className={`mx-auto h-12 w-12 ${
                      isDragOver ? 'text-blue-400' : 'text-gray-400'
                    }`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>
                        {selectedFile
                          ? 'Change video file'
                          : 'Upload a video file'}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept="video/*"
                        onChange={handleFileSelect}
                        disabled={
                          uploadState === 'uploading' ||
                          uploadState === 'processing'
                        }
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP4, AVI, MOV, WMV up to 2GB
                  </p>
                  {validationErrors.file && (
                    <p className="text-sm text-red-600">
                      {validationErrors.file}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadState === 'uploading' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg
                      className="animate-pulse w-5 h-5 text-blue-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-900">
                      Uploading to Vimeo
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600">
                  Please don't close this window while uploading...
                </p>
              </div>
            )}

            {uploadState === 'processing' && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-yellow-600"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <div className="text-center">
                    <p className="text-sm font-medium text-yellow-800">
                      Processing Video
                    </p>
                    <p className="text-xs text-yellow-600">
                      Vimeo is processing your video. This may take a few
                      minutes...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploadState === 'completed' && videoData.vimeoUrl && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-500 mt-0.5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      Video Upload Successful!
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700">
                          Video URL:
                        </span>
                        <a
                          href={videoData.vimeoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center"
                        >
                          View on Vimeo
                          <svg
                            className="w-3 h-3 ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700">
                          Vimeo ID:
                        </span>
                        <span className="text-xs font-mono text-green-800 bg-green-100 px-2 py-1 rounded">
                          {videoData.vimeoId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                disabled={
                  uploadState === 'uploading' || uploadState === 'processing'
                }
                className={`px-6 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
                  uploadState === 'uploading' || uploadState === 'processing'
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {uploadState === 'completed' ? 'Back to Dashboard' : 'Cancel'}
              </button>

              {uploadState === 'completed' ? (
                <button
                  type="button"
                  onClick={() => {
                    // Reset form for new upload
                    setVideoData({
                      title: '',
                      description: '',
                      moduleId: '',
                      courseId: '',
                    });
                    setSelectedFile(null);
                    setUploadState('idle');
                    setUploadProgress(0);
                    setMessage('');
                    setValidationErrors({});
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Upload Another Video
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startUpload}
                  disabled={
                    uploadState !== 'idle' ||
                    !selectedFile ||
                    Object.keys(validationErrors).length > 0
                  }
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    uploadState === 'idle' &&
                    selectedFile &&
                    Object.keys(validationErrors).length === 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {uploadState === 'uploading' ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Uploading...
                    </div>
                  ) : uploadState === 'processing' ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Processing...
                    </div>
                  ) : (
                    'Upload Video'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VimeoUploader;
