import React, { useState } from 'react';

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

export default function Quiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const questionCount = sampleQuiz.questions.length;
  const currentQuestion = sampleQuiz.questions[currentQ];

  const handleOptionClick = (index) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (selectedOption === null) return; // prevent next if no option selected

    if (selectedOption === currentQuestion.answerIndex) {
      setScore((prev) => prev + 1);
    }

    setSelectedOption(null);

    if (currentQ + 1 < questionCount) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-md shadow-md font-sans">
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
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}
