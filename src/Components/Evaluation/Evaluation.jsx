import React, { useState, useEffect } from 'react';
import './Evaluation.css';

const Evaluation = ({ evaluationData, onComplete, onClose }) => {
  const [responses, setResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const questionsPerPage = 3;
  const totalPages = Math.ceil(evaluationData.questions.length / questionsPerPage);
  const currentQuestions = evaluationData.questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };

  const validateCurrentPage = () => {
    const newErrors = {};
    let hasErrors = false;

    currentQuestions.forEach(question => {
      // Check if question should be shown based on dependencies
      if (question.dependsOn) {
        const dependentResponse = responses[question.dependsOn.questionId];
        if (dependentResponse !== question.dependsOn.value) {
          return; // Skip validation for hidden questions
        }
      }

      if (question.required && (!responses[question.id] || responses[question.id] === '')) {
        newErrors[question.id] = true;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentPage()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert responses to expected format
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));

      await onComplete(formattedResponses);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const isRequired = question.required;
    const hasError = errors[question.id];
    
    // Check if question should be shown based on dependencies
    if (question.dependsOn) {
      const dependentResponse = responses[question.dependsOn.questionId];
      if (dependentResponse !== question.dependsOn.value) {
        return null; // Don't render hidden questions
      }
    }

    return (
      <div key={question.id} className={`evaluation-question ${hasError ? 'has-error' : ''}`}>
        <div className="question-header">
          <h3 className="question-text">
            {question.question}
            {isRequired && <span className="required-indicator">*</span>}
          </h3>
        </div>

        <div className="question-content">
          {question.type === 'rating' && (
            <div className="rating-container">
              <div className="rating-scale">
                {[...Array(question.scale)].map((_, index) => (
                  <button
                    key={index + 1}
                    type="button"
                    className={`rating-button ${
                      responses[question.id] === index + 1 ? 'selected' : ''
                    }`}
                    onClick={() => handleResponseChange(question.id, index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              {question.labels && (
                <div className="rating-labels">
                  <span>{question.labels[1] || '1'}</span>
                  <span>{question.labels[question.scale] || question.scale}</span>
                </div>
              )}
            </div>
          )}

          {question.type === 'multiple_choice' && (
            <div className="multiple-choice-container">
              {question.options.map((option, index) => (
                <label key={index} className="choice-option">
                  <input
                    type={question.multiple ? 'checkbox' : 'radio'}
                    name={`question_${question.id}`}
                    value={option}
                    checked={
                      question.multiple
                        ? (responses[question.id] || []).includes(option)
                        : responses[question.id] === option
                    }
                    onChange={(e) => {
                      if (question.multiple) {
                        const currentValues = responses[question.id] || [];
                        if (e.target.checked) {
                          handleResponseChange(question.id, [...currentValues, option]);
                        } else {
                          handleResponseChange(question.id, currentValues.filter(v => v !== option));
                        }
                      } else {
                        handleResponseChange(question.id, option);
                      }
                    }}
                  />
                  <span className="choice-text">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'boolean' && (
            <div className="boolean-container">
              <label className="choice-option">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={true}
                  checked={responses[question.id] === true}
                  onChange={() => handleResponseChange(question.id, true)}
                />
                <span className="choice-text">Oui</span>
              </label>
              <label className="choice-option">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={false}
                  checked={responses[question.id] === false}
                  onChange={() => handleResponseChange(question.id, false)}
                />
                <span className="choice-text">Non</span>
              </label>
            </div>
          )}

          {question.type === 'text' && (
            <div className="text-container">
              {question.multiline ? (
                <textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  rows={4}
                  className="text-input"
                />
              ) : (
                <input
                  type="text"
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="text-input"
                />
              )}
            </div>
          )}

          {hasError && (
            <div className="error-message">
              Cette question est obligatoire
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <button className="close-evaluation-btn" onClick={onClose}>
          ✕
        </button>
        <div className="evaluation-info">
          <h1>{evaluationData.title}</h1>
          <p className="course-info">
            <strong>{evaluationData.courseTitle}</strong>
            <br />
            {evaluationData.lessonTitle}
          </p>
          <p className="evaluation-description">
            {evaluationData.description}
          </p>
          <div className="progress-info">
            <span>Temps estimé: {evaluationData.estimatedTime}</span>
          </div>
        </div>
      </div>

      <div className="evaluation-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">
          Page {currentPage + 1} sur {totalPages}
        </span>
      </div>

      <div className="evaluation-content">
        {currentQuestions.map(renderQuestion).filter(Boolean)}
      </div>

      <div className="evaluation-actions">
        <div className="navigation-buttons">
          <button 
            className="nav-btn prev-btn" 
            onClick={handlePrevious}
            disabled={currentPage === 0}
          >
            Précédent
          </button>
          
          {currentPage < totalPages - 1 ? (
            <button 
              className="nav-btn next-btn" 
              onClick={handleNext}
            >
              Suivant
            </button>
          ) : (
            <button 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Soumettre l\'évaluation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
