import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import CourseData from './../data/Courses.json';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useTranslation } from 'react-i18next';
import LessonBar from './LessonBar';
import { jwtDecode } from 'jwt-decode';
import LessonContent from './LessonContent';

const CourseDetails = () => {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessonStates, setLessonStates] = useState([]);
  const [currentView, setCurrentView] = useState('about');
  const [loading, setLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(true);

  const token = localStorage.getItem('access_token');
  const userId = token ? jwtDecode(token).sub : null;

  const updateLessonProgress = async (lessonId) => {
    console.log('updateLessonProgress function defined, lessonId:', lessonId);
    try {
      const response = await fetch(
        `http://localhost:8080/user-lesson-progress/?lesson_id=${lessonId}`,
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
    const fetchCourseData = async () => {
      try {
        const response = await fetch('http://localhost:8080/modules/full');
        const modules = await response.json();
        const selectedCourse = modules.find((module) => module.id === courseId);
        setCourse(selectedCourse);
      } catch (err) {
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
        const response = await fetch(
          'http://localhost:8080/user-lesson-progress/all',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();

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
  }, [course, token]);

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
  if (!course || isProgressLoading)
    return <div>{t('loading') || 'Loading...'}</div>;

  const lessonIndex = course.lessons.findIndex((l) => l.id === currentView);
  //const hasNextLesson = lessonIndex < course.lessons.length - 1;
  const hasNextLesson = true;
  return (
    <div className="flex flex-row mt-20 px-6 items-start">
      <LessonBar
        lessons={course.lessons}
        courseTitle={course.name}
        progress={progress}
        currentView={currentView}
        setCurrentView={setCurrentView}
        lessonStates={lessonStates}
      />
      <LessonContent
        currentView={currentView}
        lessonContent={lessonContent}
        about={course.about}
        token={token}
        onQuizComplete={updateLessonProgress}
        hasNextLesson={hasNextLesson}
        lessonProgress={lessonProgress}
      />
    </div>
  );
};

export default CourseDetails;
