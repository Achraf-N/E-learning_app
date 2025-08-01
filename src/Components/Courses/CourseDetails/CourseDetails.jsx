import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import CourseData from './../data/Courses.json';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useTranslation } from 'react-i18next';
import LessonBar from './LessonBar';
import { jwtDecode } from 'jwt-decode';
import { Suspense, lazy } from 'react';
const LessonContent = lazy(() => import('./LessonContent'));

const CourseDetails = () => {
  const { t } = useTranslation();
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessonStates, setLessonStates] = useState([]);
  const [currentView, setCurrentView] = useState('about');
  const [loading, setLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [lockMessage, setLockMessage] = useState('');

  const token = localStorage.getItem('access_token');
  const userId = token ? jwtDecode(token).sub : null;

  // Enhanced setCurrentView to update URL
  const setCurrentViewWithURL = useCallback(
    (view) => {
      setCurrentView(view);
      if (view === 'about') {
        navigate(`/course-details/${courseId}`, { replace: true });
      } else {
        navigate(`/course-details/${courseId}/lesson/${view}`, {
          replace: true,
        });
      }
    },
    [courseId, navigate]
  );

  // Initialize currentView based on URL params
  useEffect(() => {
    if (lessonId) {
      setCurrentView(lessonId);
    } else {
      setCurrentView('about');
    }
  }, [lessonId]);

  const updateLessonProgress = async (lessonId) => {
    console.log('updateLessonProgress function defined, lessonId:', lessonId);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/content/user-lesson-progress/?lesson_id=${lessonId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: true, // only the body content matching UserLessonProgressUpdate
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      const updatedProgress = await response.json();

      // Update lessonStates locally to mark lesson as completed
      setLessonStates((prevStates) =>
        prevStates.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Try to load course from localStorage first for instant display
    const cachedCourse = localStorage.getItem(`course_${courseId}`);
    if (cachedCourse) {
      setCourse(JSON.parse(cachedCourse));
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchCourseData = async () => {
      try {
        // Try to fetch only the selected course if backend supports it
        let selectedCourse = null;
        let response = await fetch(
          `http://localhost:8000/api/v1/content/modules/${courseId}`
        );
        if (response.ok) {
          selectedCourse = await response.json();
        } else {
          // fallback to old method if endpoint not available
          response = await fetch(
            'http://localhost:8000/api/v1/content/modules/full'
          );
          const modules = await response.json();
          selectedCourse = modules.find((module) => module.id === courseId);
        }
        setCourse(selectedCourse);
        setLoading(false);
        // Update cache for next time
        if (selectedCourse) {
          localStorage.setItem(
            `course_${courseId}`,
            JSON.stringify(selectedCourse)
          );
        }
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    };

    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!course?.lessons || !token) return;

      setIsProgressLoading(true); // Start loading progress

      try {
        // Try to fetch only progress for this course if backend supports it
        let response = await fetch(
          `http://localhost:8000/api/v1/content/user-lesson-progress/course/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        let data = [];
        if (response.ok) {
          data = await response.json();
        } else {
          // fallback to all progress
          response = await fetch(
            'http://localhost:8000/api/v1/content/user-lesson-progress/all',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          data = await response.json();
        }

        const accessedLessons = course.lessons.map((lesson) => {
          const found = data.find((p) => p.lesson_id === lesson.id);
          return {
            ...lesson,
            completed: found?.completed || false,
            score: found?.score ?? null,
            video_watched: found?.video_watched ?? false,
          };
        });

        setLessonStates(accessedLessons);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProgressLoading(false); // End loading
      }
    };

    loadProgress();
  }, [course, token, courseId]);

  const { completedCount, progress } = useMemo(() => {
    const completedCount = lessonStates.filter((l) => l.completed).length;
    const progress = course?.lessons?.length
      ? Math.round((completedCount / course.lessons.length) * 100)
      : 0;
    return { completedCount, progress };
  }, [lessonStates, course]);

  const lessonContent = useMemo(() => {
    return course?.lessons?.find((l) => l.id === currentView);
  }, [currentView, course]);
  const lessonProgress = useMemo(() => {
    return lessonStates.find((l) => l.id === currentView);
  }, [lessonStates, currentView]);

  // Get next lesson based on orderindex
  const getNextLessonId = useMemo(() => {
    if (!course?.lessons || currentView === 'about') return null;

    const currentLesson = course.lessons.find((l) => l.id === currentView);
    if (!currentLesson) return null;

    const nextLesson = course.lessons.find(
      (l) => l.orderindex === currentLesson.orderindex + 1
    );
    return nextLesson ? nextLesson.id : null;
  }, [course?.lessons, currentView]);

  // Get previous lesson based on orderindex
  const getPreviousLessonId = useMemo(() => {
    if (!course?.lessons || currentView === 'about') return null;

    const currentLesson = course.lessons.find((l) => l.id === currentView);
    if (!currentLesson) return null;

    const previousLesson = course.lessons.find(
      (l) => l.orderindex === currentLesson.orderindex - 1
    );
    return previousLesson ? previousLesson.id : null;
  }, [course?.lessons, currentView]);

  // Check if a lesson is unlocked (can be accessed)
  const isLessonUnlocked = useCallback(
    (lessonId) => {
      if (!course?.lessons || !lessonStates.length) return false;

      const lesson = course.lessons.find((l) => l.id === lessonId);
      if (!lesson) return false;

      // First lesson (orderindex 1) is always unlocked
      if (lesson.orderindex === 1) return true;

      // Find the previous lesson
      const previousLesson = course.lessons.find(
        (l) => l.orderindex === lesson.orderindex - 1
      );
      if (!previousLesson) return true; // If no previous lesson found, unlock it

      // Check if previous lesson is completed
      const previousLessonState = lessonStates.find(
        (l) => l.id === previousLesson.id
      );
      return previousLessonState?.completed === true;
    },
    [course?.lessons, lessonStates]
  );

  // Handle next lesson navigation
  const handleNextLesson = useCallback(() => {
    if (getNextLessonId) {
      // Check if next lesson is unlocked (this already checks if current lesson is completed)
      if (isLessonUnlocked(getNextLessonId)) {
        setCurrentViewWithURL(getNextLessonId);
      } else {
        // Show message that current lesson must be completed first
        const currentLesson = course?.lessons?.find(
          (l) => l.id === currentView
        );
        setLockMessage(
          `Please complete "${currentLesson?.title}" first to unlock the next lesson.`
        );
        setTimeout(() => setLockMessage(''), 5000);
      }
    }
  }, [
    getNextLessonId,
    isLessonUnlocked,
    currentView,
    course?.lessons,
    setCurrentViewWithURL,
  ]);

  // Handle previous lesson navigation
  const handlePreviousLesson = useCallback(() => {
    if (getPreviousLessonId) {
      setCurrentViewWithURL(getPreviousLessonId);
    }
  }, [getPreviousLessonId, setCurrentViewWithURL]);

  // Handle lesson selection from sidebar
  const handleLessonSelect = useCallback(
    (lessonId) => {
      if (isLessonUnlocked(lessonId)) {
        setCurrentViewWithURL(lessonId);
        setLockMessage(''); // Clear any previous lock message
      } else {
        // Show warning message for locked lessons
        const lesson = course?.lessons?.find((l) => l.id === lessonId);
        setLockMessage(
          `"${lesson?.title}" is locked. Please complete the previous lesson first.`
        );
        setTimeout(() => setLockMessage(''), 5000); // Auto-hide after 5 seconds
      }
    },
    [isLessonUnlocked, course?.lessons, setCurrentViewWithURL]
  );

  // Skeleton loader for better UX
  if (loading || !course || isProgressLoading) {
    return (
      <div className="flex flex-row mt-20 px-6 items-start animate-pulse">
        <div className="w-1/4 h-96 bg-gray-200 rounded mr-8" />
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-64 bg-gray-200 rounded w-full mb-4" />
        </div>
      </div>
    );
  }

  const lessonIndex = course.lessons.findIndex((l) => l.id === currentView);
  //const hasNextLesson = lessonIndex < course.lessons.length - 1;
  const hasNextLesson = !!getNextLessonId && isLessonUnlocked(getNextLessonId);
  const hasPreviousLesson = !!getPreviousLessonId;
  return (
    <div className="flex flex-row mt-20 px-6 items-start">
      {/* Lock Message Notification */}
      {lockMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{lockMessage}</span>
            <button
              onClick={() => setLockMessage('')}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <LessonBar
        lessons={course.lessons}
        courseTitle={course.name}
        progress={progress}
        currentView={currentView}
        setCurrentView={handleLessonSelect}
        setAboutView={() => setCurrentViewWithURL('about')}
        lessonStates={lessonStates}
        isLessonUnlocked={isLessonUnlocked}
      />
      <Suspense
        fallback={
          <div className="flex-1">
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2 animate-pulse" />
            <div className="h-64 bg-gray-200 rounded w-full mb-4 animate-pulse" />
          </div>
        }
      >
        <LessonContent
          currentView={currentView}
          lessonContent={lessonContent}
          about={course.about}
          token={token}
          onQuizComplete={updateLessonProgress}
          hasNextLesson={hasNextLesson}
          hasPreviousLesson={hasPreviousLesson}
          lessonProgress={lessonProgress}
          onNextLesson={handleNextLesson}
          onPreviousLesson={handlePreviousLesson}
        />
      </Suspense>
    </div>
  );
};

export default CourseDetails;
