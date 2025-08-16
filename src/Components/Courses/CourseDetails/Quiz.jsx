import React, { useState, useEffect } from 'react';

export default function Quiz({
  quizJson, // Prop from backend
  onComplete,
  onExitQuiz,
  onRetake,
  savedScore = null,
  hasPassed = false,
  onNextLesson,
  isFinalLesson = false,
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  const quiz = quizJson;
  const questionCount = quiz?.questions?.length || 0;
  const currentQuestion = quiz?.questions?.[currentQ];

  // Handle loading state
  useEffect(() => {
    if (quizJson) {
      setLoading(false);
      setError(null);
    } else {
      setLoading(false);
      setError('Quiz data not available.');
    }
  }, [quizJson]);

  // If savedScore is passed (quiz retaken), show results immediately
  useEffect(() => {
    if (savedScore !== null) {
      setShowResults(true);
      setScore(savedScore);
    }
  }, [savedScore]);

  // Timer for each question
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timerActive) {
      handleNext(true); // timeout
    }
  }, [timeLeft, timerActive]);

  // Start timer when question loads
  useEffect(() => {
    if (!showResults && quiz) {
      setTimeLeft(15);
      setTimerActive(true);
    }
  }, [currentQ, quiz, showResults]);

  const handleOptionClick = (index) => {
    setSelectedOption(index);
  };

  const handleNext = (isTimeout = false) => {
    const isCorrect =
      !isTimeout && selectedOption === currentQuestion?.answerIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setSelectedOption(null);
    setTimerActive(false);

    if (currentQ + 1 < questionCount) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
      onComplete?.(score + (isCorrect ? 1 : 0));
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setScore(0);
    setShowResults(false);
    setTimeLeft(15);
    setTimerActive(false);
    onRetake?.();
  };

  return (
    <div className="relative z-10 max-w-xl mx-auto p-6 bg-white rounded-md shadow-md font-sans">
      <button
        onClick={onExitQuiz}
        className="mb-4 px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
      >
        ← Back to Video
      </button>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <h3 className="text-xl font-bold mb-2 text-red-600">
            Error Loading Quiz
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : !quiz ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No quiz data available</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">{quiz.title}</h2>

          {!showResults ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-700">
                  Question {currentQ + 1} / {questionCount}
                </span>
                <div className="flex items-center">
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      timeLeft <= 5
                        ? 'bg-red-100 text-red-700'
                        : timeLeft <= 8
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {timeLeft}s
                  </div>
                </div>
              </div>

              <div className="mb-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft <= 5
                      ? 'bg-red-500'
                      : timeLeft <= 8
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${(timeLeft / 15) * 100}%` }}
                ></div>
              </div>

              <div className="mb-6 text-lg font-semibold">
                {currentQuestion?.question}
              </div>

              <ul>
                {currentQuestion?.options?.map((option, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    className={`cursor-pointer rounded-md px-4 py-2 mb-2 border ${
                      selectedOption === idx
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-blue-100 border-gray-300'
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleNext()}
                disabled={selectedOption === null}
                className={`mt-6 w-full py-2 rounded-md text-white font-semibold ${
                  selectedOption === null
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {currentQ + 1 === questionCount
                  ? 'Finish Quiz'
                  : 'Next Question'}
              </button>

              <div className="mt-4 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQ + (selectedOption !== null ? 1 : 0)) /
                        questionCount) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">Quiz Complete!</h3>
              <p className="text-xl mb-6">
                Your score:{' '}
                <span className="text-blue-600 font-bold">
                  {score} / {questionCount}
                </span>
              </p>

              {hasPassed ? (
                <>
                  <p className="text-green-600 font-semibold mb-4">
                    🎉 You passed the quiz!
                  </p>
                  <button
                    onClick={handleRestart}
                    className="mr-4 px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={onNextLesson}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {isFinalLesson
                      ? 'Ready for Final Exam? →'
                      : 'Next Lesson →'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-red-600 font-semibold mb-4">
                    Sorry, you did not pass.
                  </p>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Retake Quiz
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
