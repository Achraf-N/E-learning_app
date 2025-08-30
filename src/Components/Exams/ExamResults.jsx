import React, { useState } from 'react';
import './ExamResults.css';

const ExamResults = ({
  examResult,
  examData,
  onRetakeExam,
  onCloseResults,
}) => {
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  const getScoreColor = (grade20) => {
    if (grade20 >= 16) return '#27ae60'; // excellent
    if (grade20 >= 12) return '#f39c12'; // average-good
    return '#e74c3c'; // needs improvement
  };

  const getScoreMessage = (grade20) => {
    if (grade20 >= 16) return 'Excellent!';
    if (grade20 >= 12) return 'Good effort!';
    return 'Keep practicing!';
  };

  const formatDate = (dateString) => {
    console.log(examResult);
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="exam-results-container">
      <div className="exam-results-header">
        <h2>Exam Results</h2>
        <button className="close-results-btn" onClick={onCloseResults}>
          ✕
        </button>
      </div>

      {/* SUMMARY SECTION */}
      <div className="results-summary">
        <div className="score-card">
          <div
            className="score-circle"
            style={{ borderColor: getScoreColor(examResult.finalGrade20) }}
          >
            <span
              className="score-percentage"
              style={{ color: getScoreColor(examResult.finalGrade20) }}
            >
              {examResult.finalGrade20}/20
            </span>
            <span className="score-fraction">
              {examResult.totalPointsEarned}/{examResult.totalMaxPoints} points
            </span>
          </div>
          <div className="score-details">
            <h3>Your Grade</h3>
            <p
              className="score-message"
              style={{ color: getScoreColor(examResult.finalGrade20) }}
            >
              {getScoreMessage(examResult.finalGrade20)}
            </p>
            <p className="completion-time">
              Completed on: {formatDate(examResult.completedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="results-actions">
        <button
          className="detailed-results-btn"
          onClick={() => setShowDetailedResults(!showDetailedResults)}
        >
          {showDetailedResults ? 'Hide' : 'Show'} Detailed Results
        </button>

        <div className="action-buttons">
          <button className="retake-exam-btn" onClick={onRetakeExam}>
            Retake Exam
          </button>
          <button className="close-exam-btn" onClick={onCloseResults}>
            Close
          </button>
        </div>
      </div>

      {/* DETAILED SECTION */}
      {showDetailedResults && (
        <div className="detailed-results">
          <h3>Detailed Results</h3>
          <div className="questions-review">
            {examData.questions.map((question, index) => {
              const userAnswer = examResult.answers.find(
                (a) => a.questionId === question.id
              );
              const earned = userAnswer?.pointsEarned || 0;

              return (
                <div
                  key={question.id}
                  className={`question-review ${
                    earned > 0 ? 'correct' : 'incorrect'
                  }`}
                >
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className="points-earned">
                      {earned}/{question.type === 'resolution' ? 5 : 1} pts
                    </span>
                  </div>

                  <div className="question-content">
                    <p className="question-text">{question.question}</p>

                    {/* Show answer depending on type */}
                    {question.type === 'mcq' && (
                      <div className="mcq-options">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`mcq-option ${
                              option === userAnswer?.userAnswer
                                ? 'selected'
                                : ''
                            } ${
                              option === question.answer ? 'correct-answer' : ''
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'true_false' && (
                      <div className="tf-options">
                        <div
                          className={`tf-option ${
                            userAnswer?.userAnswer === 'True' ? 'selected' : ''
                          } ${
                            question.answer === 'True' ? 'correct-answer' : ''
                          }`}
                        >
                          True
                        </div>
                        <div
                          className={`tf-option ${
                            userAnswer?.userAnswer === 'False' ? 'selected' : ''
                          } ${
                            question.answer === 'False' ? 'correct-answer' : ''
                          }`}
                        >
                          False
                        </div>
                      </div>
                    )}

                    {question.type === 'resolution' && (
                      <div className="resolution-answer">
                        <div className="user-answer">
                          <strong>Your Answer:</strong>
                          <p>
                            {userAnswer?.userAnswer || 'No answer provided'}
                          </p>
                        </div>
                        <div className="correct-answer">
                          <strong>Model Answer:</strong>
                          <p>{question.answer}</p>
                        </div>
                        {userAnswer?.similarity !== undefined && (
                          <div>
                            <em>Similarity score: {userAnswer.similarity}%</em>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResults;
