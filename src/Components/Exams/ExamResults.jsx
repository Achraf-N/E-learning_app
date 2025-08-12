import React, { useState } from 'react';
import './ExamResults.css';

const ExamResults = ({
  examResult,
  examData,
  onRetakeExam,
  onCloseResults,
}) => {
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#27ae60'; // Green for excellent
    if (percentage >= 60) return '#f39c12'; // Orange for good
    return '#e74c3c'; // Red for needs improvement
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80)
      return 'Excellent! You have a strong understanding of the material.';
    if (percentage >= 60)
      return 'Good job! You have a solid grasp of the concepts.';
    return 'Keep practicing! Review the material and try again.';
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'resolution':
        return 'Resolution';
      default:
        return type;
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'mcq':
        return '📝';
      case 'true_false':
        return '✅';
      case 'resolution':
        return '✍️';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString) => {
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

      <div className="results-summary">
        <div className="score-card">
          <div
            className="score-circle"
            style={{ borderColor: getScoreColor(examResult.percentage) }}
          >
            <span
              className="score-percentage"
              style={{ color: getScoreColor(examResult.percentage) }}
            >
              {examResult.percentage}%
            </span>
            <span className="score-fraction">
              {examResult.score}/{examResult.totalQuestions}
            </span>
          </div>
          <div className="score-details">
            <h3>Your Score</h3>
            <p
              className="score-message"
              style={{ color: getScoreColor(examResult.percentage) }}
            >
              {getScoreMessage(examResult.percentage)}
            </p>
            <p className="completion-time">
              Completed on: {formatDate(examResult.completedAt)}
            </p>
          </div>
        </div>

        <div className="results-breakdown">
          <h3>Question Breakdown</h3>
          <div className="breakdown-stats">
            {examData.questions
              .reduce((acc, question) => {
                const type = question.type;
                if (!acc[type]) {
                  acc[type] = { total: 0, correct: 0 };
                }
                acc[type].total++;
                const userAnswer = examResult.answers.find(
                  (a) => a.questionId === question.id
                );
                if (userAnswer && userAnswer.isCorrect) {
                  acc[type].correct++;
                }
                return acc;
              }, {})
              .map((type, stats) => (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-icon">
                    {getQuestionTypeIcon(type)}
                  </span>
                  <div className="breakdown-info">
                    <span className="breakdown-type">
                      {getQuestionTypeLabel(type)}
                    </span>
                    <span className="breakdown-score">
                      {stats.correct}/{stats.total} correct
                    </span>
                  </div>
                  <div className="breakdown-percentage">
                    {Math.round((stats.correct / stats.total) * 100)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

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

      {showDetailedResults && (
        <div className="detailed-results">
          <h3>Detailed Results</h3>
          <div className="questions-review">
            {examData.questions.map((question, index) => {
              const userAnswer = examResult.answers.find(
                (a) => a.questionId === question.id
              );
              const isCorrect = userAnswer?.isCorrect;

              return (
                <div
                  key={question.id}
                  className={`question-review ${
                    isCorrect ? 'correct' : 'incorrect'
                  }`}
                >
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className="question-type">
                      {getQuestionTypeIcon(question.type)}{' '}
                      {getQuestionTypeLabel(question.type)}
                    </span>
                    <span
                      className={`question-status ${
                        isCorrect ? 'correct' : 'incorrect'
                      }`}
                    >
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className="question-content">
                    <p className="question-text">{question.question}</p>

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
                          <strong>Expected Answer:</strong>
                          <p>{question.answer}</p>
                        </div>
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
