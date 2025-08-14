import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExamContainer from './ExamContainer';

const ExamPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [showThankYou, setShowThankYou] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleExamComplete = (result) => {
    console.log('Exam completed:', result);
    setShowThankYou(true);

    // Start countdown
    let timer = 5;
    const countdownInterval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(countdownInterval);
        navigate('/');
      }
    }, 1000);
  };

  const handleClose = () => {
    // Navigate back to course details
    navigate(`/course-details/${courseId}`);
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for completing the test. Your results will be sent soon.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Redirecting to main page in{' '}
                <span className="font-bold">{countdown}</span> seconds...
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Main Page Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ExamContainer
        courseId={courseId}
        lessonId={null} // For final exam, lessonId is not needed
        onExamComplete={handleExamComplete}
        onClose={handleClose}
      />
    </div>
  );
};

export default ExamPage;
