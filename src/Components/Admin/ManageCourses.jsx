import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:8000/api/v1';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  const accessToken = useMemo(
    () => localStorage.getItem('access_token') || '',
    []
  );

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      setCoursesError('');
      try {
        const response = await fetch(`${API_BASE}/content/modules/full`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to load courses (${response.status})`);
        }
        const data = await response.json();
        const normalized = Array.isArray(data) ? data : [];
        setCourses(normalized);
        if (normalized.length > 0) {
          const firstCourse = normalized[0];
          const firstId = firstCourse?.id || firstCourse?.module_id || '';
          setSelectedCourseId(firstId);
          setSelectedCourse(firstCourse);
          const lessons = Array.isArray(firstCourse?.lessons)
            ? firstCourse.lessons
            : [];
          if (lessons.length > 0) {
            const firstLessonId = lessons[0]?.id || lessons[0]?.lesson_id || '';
            setSelectedLessonId(firstLessonId);
          } else {
            setSelectedLessonId('');
          }
        }
      } catch (error) {
        setCoursesError(error?.message || 'Unable to fetch courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null);
      setSelectedLessonId('');
      return;
    }
    const found = courses.find(
      (c) => String(c?.id || c?.module_id) === String(selectedCourseId)
    );
    setSelectedCourse(found || null);
    if (found && Array.isArray(found.lessons) && found.lessons.length > 0) {
      const firstLessonId =
        found.lessons[0]?.id || found.lessons[0]?.lesson_id || '';
      setSelectedLessonId(String(firstLessonId));
    } else {
      setSelectedLessonId('');
    }
  }, [selectedCourseId, courses]);

  const onFileChange = (event) => {
    setUploadMessage('');
    setUploadError('');
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploadMessage('');
    setUploadError('');

    if (!selectedCourseId) {
      setUploadError('Please select a course first.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please choose a PDF file to upload.');
      return;
    }
    if (!selectedLessonId) {
      setUploadError('Please select a lesson.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('lesson_id', String(selectedLessonId));
      formData.append('title', selectedFile.name.replace('.pdf', ''));

      const response = await fetch(
        `${API_BASE}/content/lessonfiles/upload-and-create`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Upload failed (${response.status})`);
      }

      // Try read JSON, fallback to text
      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {
        // ignore
      }
      setUploadMessage('PDF uploaded successfully.');
      setSelectedFile(null);
      // Optionally refresh any list of PDFs here when an endpoint exists
      // await refreshPdfsForCourse();
    } catch (error) {
      setUploadError(error?.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-600 mt-2">
            Upload PDF lessons to your selected course.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              {isLoadingCourses ? (
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              ) : coursesError ? (
                <div className="text-red-600 text-sm">{coursesError}</div>
              ) : (
                <select
                  value={String(selectedCourseId)}
                  onChange={(e) => setSelectedCourseId(String(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {courses.map((course) => {
                    const id = String(course?.id || course?.module_id || '');
                    const title =
                      course?.title || course?.name || `Course ${id}`;
                    return (
                      <option key={id} value={id}>
                        {title}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lesson
              </label>
              {selectedCourse ? (
                <select
                  value={String(selectedLessonId)}
                  onChange={(e) => setSelectedLessonId(String(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {(Array.isArray(selectedCourse?.lessons)
                    ? selectedCourse.lessons
                    : []
                  ).map((lesson) => {
                    const id = String(lesson?.id || lesson?.lesson_id || '');
                    const title =
                      lesson?.title || lesson?.name || `Lesson ${id}`;
                    return (
                      <option key={id} value={id}>
                        {title}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="h-10 bg-gray-100 rounded" />
              )}
            </div>

            <div className="md:col-span-1 md:col-start-3">
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose PDF file
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={onFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-xs text-gray-500">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading…' : 'Upload PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadMessage('');
                      setUploadError('');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>

                {uploadMessage && (
                  <div className="text-green-600 text-sm">{uploadMessage}</div>
                )}
                {uploadError && (
                  <div className="text-red-600 text-sm">{uploadError}</div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            PDF Lessons
          </h2>
          <p className="text-gray-600 text-sm">
            Listing, updating, and deleting PDFs will appear here once the API
            endpoints are available. For now, you can upload PDFs above.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded border border-dashed border-gray-200">
            <p className="text-xs text-gray-500">
              Selected course:{' '}
              <span className="font-medium text-gray-700">
                {selectedCourse?.title ||
                  selectedCourse?.name ||
                  selectedCourseId ||
                  '—'}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Selected lesson:{' '}
              <span className="font-medium text-gray-700">
                {(selectedCourse?.lessons || []).find(
                  (l) => (l?.id || l?.lesson_id) === selectedLessonId
                )?.title ||
                  selectedLessonId ||
                  '—'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;
