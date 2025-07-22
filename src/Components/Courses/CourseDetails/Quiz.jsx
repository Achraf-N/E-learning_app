import React, { useState, useEffect } from 'react';

const sampleQuiz = {
  title: 'Sample Quiz',
  questions: [
    {
      id: 1,
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Lisbon'],
      answerIndex: 2,
    },
    {
      id: 2,
      question: 'Which language runs in a web browser?',
      options: ['Java', 'C', 'Python', 'JavaScript'],
      answerIndex: 3,
    },
    {
      id: 3,
      question: 'What does CSS stand for?',
      options: [
        'Central Style Sheets',
        'Cascading Style Sheets',
        'Cascading Simple Sheets',
        'Cars SUVs Sailboats',
      ],
      answerIndex: 1,
    },
    {
      id: 4,
      question: 'Which company developed React?',
      options: ['Google', 'Facebook', 'Twitter', 'Microsoft'],
      answerIndex: 1,
    },
    {
      id: 5,
      question: 'What does HTML stand for?',
      options: [
        'HyperText Markup Language',
        'Hyperlink Text Mark Language',
        'Hyperlinking Text Marking Language',
        'HyperTool Multi Language',
      ],
      answerIndex: 0,
    },
  ],
};

export default function Quiz({
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

  const questionCount = sampleQuiz.questions.length;
  const currentQuestion = sampleQuiz.questions[currentQ];

  useEffect(() => {
    // If savedScore is passed (quiz retaken), show results immediately
    if (savedScore !== null) {
      setShowResults(true);
      setScore(savedScore);
    }
  }, [savedScore]);

  const handleOptionClick = (index) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    if (selectedOption === currentQuestion.answerIndex) {
      setScore((prev) => prev + 1);
    }

    setSelectedOption(null);

    if (currentQ + 1 < questionCount) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
      if (onComplete) {
        onComplete(
          score + (selectedOption === currentQuestion.answerIndex ? 1 : 0)
        );
      }
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setScore(0);
    setShowResults(false);
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
      <h2 className="text-2xl font-bold mb-6 text-center">
        {sampleQuiz.title}
      </h2>

      {!showResults ? (
        <>
          <div className="mb-4 text-gray-700">
            Question {currentQ + 1} / {questionCount}
          </div>

          <div className="mb-6 text-lg font-semibold">
            {currentQuestion.question}
          </div>

          <ul>
            {currentQuestion.options.map((option, idx) => (
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
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`mt-6 w-full py-2 rounded-md text-white font-semibold
              ${
                selectedOption === null
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {currentQ + 1 === questionCount ? 'Finish Quiz' : 'Next Question'}
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
    </div>
  );
}
