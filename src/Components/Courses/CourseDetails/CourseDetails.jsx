import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  useParams,
  useNavigate,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import CourseData from './../data/Courses.json';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useTranslation } from 'react-i18next';
import LessonBar from './LessonBar';
import ExamContainer from '../../Exams/ExamContainer';
import { jwtDecode } from 'jwt-decode';
import { Suspense, lazy } from 'react';
const LessonContent = lazy(() => import('./LessonContent'));

const CourseDetails = () => {
  const { t } = useTranslation();
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessonStates, setLessonStates] = useState([]);
  const [currentView, setCurrentView] = useState('about');
  const [loading, setLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [lockMessage, setLockMessage] = useState('');

  const token = localStorage.getItem('access_token');
  const userId = token ? jwtDecode(token).sub : null;

  // Function to handle exam upload when starting last lesson
  const handleStartLastLesson = async () => {
    if (!course || !userId || !course.lessons?.length) return;

    // Get the last lesson based on orderindex
    const lastLesson = course.lessons.reduce((prev, current) =>
      current.orderindex > prev.orderindex ? current : prev
    );

    // Only trigger for last lesson
    if (currentView === lastLesson.id) {
      console.log(userId, course.id, course.lessons);
      try {
        await fetch(
          'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/upload-exam',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              module_id: course.id,
              user_id: userId,
              supabase_urls: course.summary_pdf ? [course.summary_pdf] : [],,
            }),
          }
        );
        console.log('Exam upload request sent for last lesson');
      } catch (err) {
        console.error('Error uploading exam:', err);
      }
    }
  };

  // Function to generate exam after last lesson quiz completion
  const handleGenerateExamAfterQuiz = async () => {
    if (!course) return;

    setLockMessage('⏳ Generating your final exam...');

    try {
      const response = await fetch(
        'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/exams/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            module_id: course.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate exam');
      }

      console.log('Exam generation request completed successfully');

      // Show success message that exam is ready
      setLockMessage(
        "🎉 Congratulations! You've completed all lessons. Your final exam has been generated and is now available in the sidebar."
      );
      setTimeout(() => setLockMessage(''), 8000);
    } catch (err) {
      console.error('Error generating exam:', err);
      setLockMessage('❌ Error generating exam. Please try again later.');
      setTimeout(() => setLockMessage(''), 5000);
    }
  };

  // Enhanced setCurrentView to update URL
  const setCurrentViewWithURL = useCallback(
    (view) => {
      setCurrentView(view);
      if (view === 'about') {
        navigate(`/course-details/${courseId}`, { replace: true });
      } else if (view === 'exam') {
        navigate(`/course-details/${courseId}/exam`, { replace: true });
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
    if (location.pathname.endsWith('/exam')) {
      setCurrentView('exam');
    } else if (lessonId) {
      setCurrentView(lessonId);
    } else {
      setCurrentView('about');
    }
  }, [lessonId, location.pathname]);

  // Call handleStartLastLesson when user navigates to the last lesson
  useEffect(() => {
    if (!course?.lessons?.length) return;

    const lastLesson = course.lessons.reduce((prev, current) =>
      current.orderindex > prev.orderindex ? current : prev
    );

    if (currentView === lastLesson.id) {
      handleStartLastLesson();
    }
  }, [currentView, course?.lessons]);

  const updateLessonProgress = async (lessonId,score) => {
    console.log('updateLessonProgress function defined, lessonId:', lessonId);
    try {
      const response = await fetch(
        `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/user-lesson-progress/?lesson_id=${lessonId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: true,
            score: score, // only the body content matching UserLessonProgressUpdate
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      const updatedProgress = await response.json();

      // Update lessonStates locally to mark lesson as completed
      setLessonStates((prevStates) => {
        const nextStates = prevStates.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, completed: true, score: updatedProgress.score }
            : lesson
        );

        // Check if this is the last lesson and call exam generation API
        const lastLesson = course.lessons.reduce((prev, current) =>
          current.orderindex > prev.orderindex ? current : prev
        );

        if (lessonId === lastLesson.id) {
          handleGenerateExamAfterQuiz();
        }

        // Don't auto-redirect to exam - let user navigate manually
        // User will see success message and can click exam in sidebar when ready

        return nextStates;
      });
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
          `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/modules/full/${courseId}`
        );
        if (response.ok) {
          selectedCourse = await response.json();
          console.log('selected courses : ', selectedCourse);
        } else {
          // fallback to old method if endpoint not available
          response = await fetch(
            'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/modules/full'
          );
          const modules = await response.json();
          selectedCourse = modules.find((module) => module.id === courseId);
        }
        setCourse(
          Array.isArray(selectedCourse) ? selectedCourse[0] : selectedCourse
        );
        setLoading(false);
        // Update cache for next time

        console.log('selected courses 2: ', selectedCourse);
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
      console.log('selected courses 4: ', course?.lessons);
      if (!course?.lessons || !token) return;

      console.log('selected courses 5: ');
      setIsProgressLoading(true); // Start loading progress

      try {
        const response = await fetch(
          'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/user-lesson-progress/all',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.ok ? await response.json() : [];

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

  const examUnlocked = useMemo(
    () => progress === 100 && (course?.lessons?.length ?? 0) > 0,
    [progress, course?.lessons]
  );

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
    } else {
      // No next lesson - this is the final lesson
      // Check if exam is unlocked and open it
      if (examUnlocked) {
        // Show confirmation message before opening exam
        setLockMessage(
          "🎉 Congratulations! You've completed all lessons. Opening the Final Exam..."
        );
        setTimeout(() => {
          setCurrentViewWithURL('exam');
          setLockMessage('');
        }, 2000);
      } else {
        // Show message that all lessons must be completed
        setLockMessage('Complete all lessons to unlock the final exam.');
        setTimeout(() => setLockMessage(''), 5000);
      }
    }
  }, [
    getNextLessonId,
    isLessonUnlocked,
    currentView,
    course?.lessons,
    setCurrentViewWithURL,
    examUnlocked,
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
      if (lessonId === 'exam') {
        if (examUnlocked) {
          setCurrentViewWithURL('exam');
          setLockMessage('');
        } else {
          setLockMessage(
            'Final exam is locked. Complete all lessons to unlock.'
          );
          setTimeout(() => setLockMessage(''), 5000);
        }
        return;
      }

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
    [isLessonUnlocked, examUnlocked, course?.lessons, setCurrentViewWithURL]
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

  // Check if current lesson is the final lesson
  const isFinalLesson =
    !getNextLessonId && currentView !== 'about' && currentView !== 'exam';
  return (
    <div className="flex flex-row mt-20 px-6 items-start">
      {/* Lock Message Notification */}
      {lockMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg max-w-md ${
            lockMessage.includes('Congratulations') ||
            lockMessage.includes('🎉')
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          <div className="flex items-center">
            {lockMessage.includes('Congratulations') ||
            lockMessage.includes('🎉') ? (
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
            ) : (
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
            )}
            <span className="text-sm">{lockMessage}</span>
            <button
              onClick={() => setLockMessage('')}
              className={`ml-2 hover:opacity-70 ${
                lockMessage.includes('Congratulations') ||
                lockMessage.includes('🎉')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
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
        examUnlocked={examUnlocked}
      />
      {currentView !== 'exam' && (
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
            examUnlocked={examUnlocked}
            onOpenExam={() => handleLessonSelect('exam')}
            isFinalLesson={isFinalLesson}
          />
        </Suspense>
      )}

      {currentView === 'exam' && (
        <div className="flex-1 ml-80">
          <ExamContainer
            courseId={courseId}
            lessonId="final"
            onExamComplete={() => {}}
            onClose={() => setCurrentViewWithURL('about')}
          />
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
