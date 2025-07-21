import React, { useState } from 'react';
import Quiz from './Quiz'; // import your Quiz component
import VideoPlayer from './VideoPlayer';

const LessonContent = ({
  currentView,
  lessonContent,
  about,
  lessonId,
  token,
  onNextLesson,
  hasNextLesson,
  onQuizComplete,
}) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const handleQuizComplete = (score) => {
    const passed = score >= 70;
    setQuizPassed(passed);
    setShowNextButton(passed && hasNextLesson);
    onQuizComplete?.(score);
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
          <VideoPlayer
            videoUrl={lessonContent.video}
            onStartQuiz={() => setQuizStarted(true)}
          />
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
          lessonId={lessonId}
          token={token}
          onComplete={handleQuizComplete}
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
