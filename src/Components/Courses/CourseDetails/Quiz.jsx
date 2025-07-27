import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8002'; // Update with your FastAPI server URL

export default function Quiz({
  quizId, // New prop to receive quiz ID
  onComplete,
  onExitQuiz,
  onRetake,
  savedScore = null,
  hasPassed = false,
  onNextLesson,
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  const questionCount = quiz?.questions?.length || 0;
  const currentQuestion = quiz?.questions?.[currentQ];

  useEffect(() => {
    // If savedScore is passed (quiz retaken), show results immediately
    if (savedScore !== null) {
      setShowResults(true);
      setScore(savedScore);
    }
  }, [savedScore]);

  // Timer effect for each question
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timerActive) {
      // Time's up - automatically move to next question (counts as wrong answer)
      handleNext(true); // Pass true to indicate timeout
    }
  }, [timeLeft, timerActive]);

  // Start timer when question loads
  useEffect(() => {
    if (!showResults && quiz) {
      setTimeLeft(15);
      setTimerActive(true);
    }
  }, [currentQ, quiz, showResults]);

  // Fetch quiz data from API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!quizId) {
          throw new Error('Quiz ID is required');
        }

        const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Quiz not found or expired');
          }
          throw new Error(`Failed to fetch quiz: ${response.status}`);
        }

        const quizData = await response.json();
        setQuiz(quizData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionClick = (index) => {
    if (timerActive) {
      setSelectedOption(index);
      setTimerActive(false); // Stop timer when answer is selected
    }
  };

  const handleNext = (isTimeout = false) => {
    // If timeout occurred, selectedOption will be null (wrong answer)
    const isCorrect =
      !isTimeout && selectedOption === currentQuestion.answerIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setSelectedOption(null);
    setTimerActive(false);

    if (currentQ + 1 < questionCount) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
      if (onComplete) {
        onComplete(score + (isCorrect ? 1 : 0));
      }
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setScore(0);
    setShowResults(false);
    setTimeLeft(15);
    setTimerActive(false);
    if (onRetake) onRetake();
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
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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
                {/* Timer Display */}
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
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {timeLeft}s
                  </div>
                </div>
              </div>

              {/* Timer Progress Bar */}
              <div className="mb-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timeLeft <= 5
                      ? 'bg-red-500'
                      : timeLeft <= 8
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${(timeLeft / 15) * 100}%`,
                  }}
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
                    className={`cursor-pointer rounded-md px-4 py-2 mb-2 border
                      ${
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
                className={`mt-6 w-full py-2 rounded-md text-white font-semibold
                  ${
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
                    Next Lesson →
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
