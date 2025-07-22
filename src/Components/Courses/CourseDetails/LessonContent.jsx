import React, { useState, useEffect } from 'react';
import Quiz from './Quiz'; // import your Quiz component
import VideoPlayer from './VideoPlayer';

const LessonContent = ({
  currentView,
  lessonContent,
  about,
  lessonId,
  token,
  onQuizComplete,
  hasNextLesson,
  lessonProgress,
  onNextLesson,
}) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    if (lessonProgress?.video_watched !== undefined) {
      console.log(
        'lessonProgress.video_watched:',
        lessonProgress?.video_watched
      );
      setVideoWatched(lessonProgress.video_watched);
    }
  }, [lessonProgress]);

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

  const handleNextLesson = () => {
    setQuizStarted(false);
    setQuizPassed(false);
    setShowNextButton(false);
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
      <h2 className="text-xl font-bold mb-4">{lessonContent.title}</h2>

      {!quizStarted ? (
        <>
          {lessonContent.video ? (
            <VideoPlayer
              videoUrl={lessonContent.video}
              onStartQuiz={() => setQuizStarted(true)}
              videoWatched={videoWatched}
              key={lessonContent.id}
            />
          ) : (
            <p>No video available for this lesson.</p>
          )}
          {quizPassed && showNextButton && (
            <button
              onClick={handleNextLesson}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors duration-300"
            >
              Next Lesson →
            </button>
          )}
        </>
      ) : (
        <Quiz
          onComplete={handleQuizComplete}
          onExitQuiz={() => setQuizStarted(false)}
          onRetake={() => {
            setQuizStarted(true);
            setQuizPassed(false);
            setShowNextButton(false);
          }}
          hasPassed={quizPassed}
          savedScore={quizPassed ? lastScore : null}
          onNextLesson={handleNextLesson}
        />
      )}

      {lessonContent.pdf && (
        <a
          href={lessonContent.pdf}
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
