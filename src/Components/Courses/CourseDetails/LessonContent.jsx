import React, { useState, useEffect } from 'react';
import Quiz from './Quiz'; // import your Quiz component
import VideoPlayer from './VideoPlayer';

const API_BASE_URL = 'http://localhost:8000/api/v1/agent';

const LessonContent = ({
  currentView,
  lessonContent,
  about,
  lessonId,
  token,
  onQuizComplete,
  hasNextLesson,
  hasPreviousLesson,
  lessonProgress,
  onNextLesson,
  onPreviousLesson,
  examUnlocked,
  onOpenExam,
  isFinalLesson = false, // New prop to indicate if this is the final lesson
}) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [quizError, setQuizError] = useState(null);

  useEffect(() => {
    if (lessonProgress?.video_watched !== undefined) {
      console.log(
        'lessonProgress.video_watched:',
        lessonProgress?.video_watched
      );
      setVideoWatched(lessonProgress.video_watched);
    }
  }, [lessonProgress]);

  // Reset quiz state when lesson changes
  useEffect(() => {
    setQuizStarted(false);
    setQuizId(null);
    setQuizError(null);
  }, [lessonContent?.id]);

  useEffect(() => {
    if (!lessonProgress) return;
    if (lessonProgress.score !== undefined && lessonProgress.score >= 3) {
      console.log('lessonProgress.score:', lessonProgress.score);
      setLastScore(lessonProgress.score);
      setQuizPassed(true);
      setShowNextButton(true);
    } else {
      setLastScore(null);
      setQuizPassed(false);
      setShowNextButton(false);
    }
  }, [lessonProgress]);

  const handleQuizComplete = async (score) => {
    console.log('Quiz completed with score:', score);
    const passed = score >= 3;
    setLastScore(score);
    setQuizPassed(passed);
    setShowNextButton(passed && hasNextLesson);
    if (passed) {
      await onQuizComplete(lessonContent.id, score); // pass lesson id to parent
      //setQuizStarted(false);
    }
  };

  // Start quiz using existing quiz ID from lesson data
  const startQuiz = () => {
    console.log('Starting quiz for lesson:', lessonContent.quizId);
    if (!lessonContent.quiz_id) {
      setQuizError('No quiz available for this lesson');
      return;
    }

    setQuizId(lessonContent.quiz_id);
    setQuizStarted(true);
  };

  const handleNextLesson = () => {
    setQuizStarted(false);
    setQuizPassed(false);
    setShowNextButton(false);
    setQuizId(null);
    setQuizError(null);
    onNextLesson?.();
  };

  if (currentView === 'about') {
    return (
      <div className="flex-1 p-6 bg-white rounded-lg shadow ml-80">
        <h2 className="text-xl font-bold mb-4">About This Course</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {about?.en || 'No description available.'}
        </p>
      </div>
    );
  }

  if (!lessonContent) {
    return <p className="ml-80">No lesson selected.</p>;
  }

  return (
    <main className="flex-1 p-6 bg-white rounded-lg shadow ml-80">
      {/* Navigation Bar - Top Left like Coursera/Udemy */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 md:space-x-3">
          {hasPreviousLesson && (
            <button
              onClick={onPreviousLesson}
              className="flex items-center px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap min-w-0"
            >
              <svg
                className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
          )}

          {hasNextLesson && (
            <button
              onClick={onNextLesson}
              className="flex items-center px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap min-w-0"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <svg
                className="w-3 h-3 md:w-4 md:h-4 ml-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Lesson Progress Indicator */}
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          {lessonProgress?.completed && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Completed
            </span>
          )}

          {examUnlocked && (
            <button
              type="button"
              onClick={onOpenExam}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              title="Open Final Exam"
            >
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Final Exam
            </button>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">{lessonContent.title}</h2>

      {!quizStarted ? (
        <>
          {lessonContent.video ? (
            <VideoPlayer
              videoUrl={lessonContent.video}
              onStartQuiz={() => {
                if (lessonContent.quiz_id) {
                  startQuiz();
                } else {
                  setQuizError('No quiz available for this lesson');
                }
              }}
              videoWatched={videoWatched}
              key={lessonContent.id}
            />
          ) : (
            <p>No video available for this lesson.</p>
          )}

          {quizError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{quizError}</p>
            </div>
          )}
        </>
      ) : (
        <Quiz
          quizId={quizId}
          onComplete={handleQuizComplete}
          onExitQuiz={() => {
            setQuizStarted(false);
            setQuizId(null);
            setQuizError(null);
          }}
          onRetake={() => {
            setQuizStarted(true);
            setQuizPassed(false);
            setShowNextButton(false);
          }}
          hasPassed={quizPassed}
          savedScore={quizPassed ? lastScore : null}
          onNextLesson={handleNextLesson}
          isFinalLesson={isFinalLesson}
        />
      )}

      {lessonContent.pdf && (
        <a
          href={`${lessonContent.pdf.split('\\').pop()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-blue-600 hover:underline"
        >
          📄 Download PDF
        </a>
      )}
    </main>
  );
};

export default LessonContent;
