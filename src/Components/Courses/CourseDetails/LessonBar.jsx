import React, { useState, useEffect, useMemo, useCallback } from 'react';

const LessonBar = ({ lessons, courseTitle, about, userId }) => {
  const [currentView, setCurrentView] = useState('about');
  const [lessonStates, setLessonStates] = useState([]); // start empty: only accessed lessons
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('access_token');

  // Memoize progress calculation
  const { completedCount, progress } = useMemo(() => {
    const completedCount = lessonStates.filter((l) => l.completed).length;
    const progress =
      lessons.length > 0
        ? Math.round((completedCount / lessons.length) * 100)
        : 0;
    return { completedCount, progress };
  }, [lessonStates, lessons.length]);

  // Cache lesson content lookup
  const lessonContent = useMemo(
    () =>
      currentView !== 'about'
        ? lessons.find((l) => l.id === currentView) // lookup in all lessons for content
        : null,
    [currentView, lessons]
  );

  // Preload user progress on mount (fetch lessons user already accessed)
  useEffect(() => {
    const loadInitialProgress = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/user-lesson-progress/all',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const progressData = await response.json();
          // progressData: array of { lesson_id, completed, ... }
          // Build lessonStates as lessons user already accessed + completion info
          const accessedLessons = lessons
            .filter((lesson) =>
              progressData.some((p) => p.lesson_id === lesson.id)
            )
            .map((lesson) => {
              const prog = progressData.find((p) => p.lesson_id === lesson.id);
              return { ...lesson, completed: prog?.completed || false };
            });
          setLessonStates(accessedLessons);
        }
      } catch (error) {
        console.error('Progress load failed', error);
      }
    };

    loadInitialProgress();
  }, [token, userId, lessons]);

  // Handle lesson click
  const handleLessonClick = useCallback(
    async (lesson) => {
      setCurrentView(lesson.id);

      console.log('handleLessonClick triggered for lesson:', lesson.id);

      const hasProgressRecord = lessonStates.some((l) => l.id === lesson.id);

      if (hasProgressRecord) {
        // Ne fait rien (pas d’appel API)
        console.log('Progression déjà existante, pas de POST.');
        return;
      }
      // Just do fetch directly without timeout or try-catch for now

      console.log('Sending POST request...');

      fetch('http://localhost:8080/user-lesson-progress/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lesson_id: lesson.id }),
      })
        .then((res) => {
          console.log('Response status:', res.status);
          if (!res.ok) throw new Error('Fetch failed');
          return res.json();
        })
        .then((data) => {
          console.log('POST response data:', data);
          setLessonStates((prev) => [
            ...prev,
            { ...lesson, completed: data.completed },
          ]);
        })
        .catch((e) => {
          console.error('Fetch error:', e);
        });
    },
    [token, setLessonStates, lessonStates]
  );

  return (
    <div className="flex flex-row mt-20 px-6 items-start">
      <aside className="w-72 p-4 bg-white rounded-lg shadow absolute top-0 left-0 z-10 overflow-y-auto h-screen mt-36">
        <h2 className="text-md font-semibold text-gray-800 mb-4">
          {courseTitle}
        </h2>

        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mb-4">{progress}% COMPLETE</p>

        <div
          className={`p-2 rounded mb-1 cursor-pointer ${
            currentView === 'about'
              ? 'bg-blue-100 border-l-4 border-blue-500'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => setCurrentView('about')}
        >
          <span className="text-sm text-gray-700">📘 About This Course</span>
        </div>

        {lessons.map((lesson) => {
          const completed = lessonStates.find(
            (l) => l.id === lesson.id
          )?.completed;
          return (
            <div
              key={lesson.id}
              className={`p-2 rounded mb-1 cursor-pointer ${
                currentView === lesson.id
                  ? 'bg-blue-100 border-l-4 border-blue-500'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleLessonClick(lesson)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{lesson.title}</span>
                {completed && <span className="text-green-500 text-sm">✓</span>}
              </div>
            </div>
          );
        })}
      </aside>

      <main className="flex-1 p-6 bg-white rounded-lg shadow ml-80">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentView === 'about' ? (
          <>
            <h2 className="text-xl font-bold mb-4">About This Course</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {about?.en || 'No description available.'}
            </p>
          </>
        ) : lessonContent ? (
          <>
            <h2 className="text-xl font-bold mb-4">{lessonContent.title}</h2>
            <video
              controls
              src={lessonContent.video}
              className="w-full rounded-lg shadow"
              preload="none" // Lazy load video
            />
            <a
              href={lessonContent.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-blue-600 hover:underline"
            >
              📄 Télécharger PDF
            </a>
          </>
        ) : (
          <p>No lesson selected.</p>
        )}
      </main>
    </div>
  );
};

export default LessonBar;
