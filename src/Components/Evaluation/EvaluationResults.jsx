import React, { useState } from 'react';
import './EvaluationResults.css';

const EvaluationResults = ({ evaluationResult, evaluationData, onRetry, onClose }) => {
  const [showDetailedResponses, setShowDetailedResponses] = useState(false);

  const getSatisfactionLevel = (rating) => {
    if (rating >= 4.5) return { text: 'Excellent', color: '#27ae60' };
    if (rating >= 3.5) return { text: 'Très bien', color: '#2ecc71' };
    if (rating >= 2.5) return { text: 'Bien', color: '#f39c12' };
    if (rating >= 1.5) return { text: 'Moyen', color: '#e67e22' };
    return { text: 'À améliorer', color: '#e74c3c' };
  };

  const formatAnswer = (answer, question) => {
    switch (question.type) {
      case 'rating':
        const maxScale = question.scale || 5;
        return `${answer}/${maxScale}`;
      
      case 'boolean':
        return answer ? 'Oui' : 'Non';
      
      case 'multiple_choice':
        if (Array.isArray(answer)) {
          return answer.join(', ');
        }
        return answer;
      
      case 'text':
        return answer || 'Aucune réponse';
      
      default:
        return String(answer);
    }
  };

  const getQuestionIcon = (type) => {
    switch (type) {
      case 'rating': return '⭐';
      case 'boolean': return '✓';
      case 'multiple_choice': return '📋';
      case 'text': return '💬';
      default: return '❓';
    }
  };

  const satisfaction = getSatisfactionLevel(evaluationResult.averageRating);

  return (
    <div className="evaluation-results-container">
      <div className="evaluation-results-header">
        <h2>Merci pour votre évaluation !</h2>
        <button className="close-results-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Summary Section */}
      <div className="results-summary">
        <div className="satisfaction-card">
          <div 
            className="satisfaction-circle"
            style={{ borderColor: satisfaction.color }}
          >
            <span 
              className="satisfaction-rating"
              style={{ color: satisfaction.color }}
            >
              {evaluationResult.averageRating.toFixed(1)}
            </span>
            <span className="rating-scale">/5.0</span>
          </div>
          <div className="satisfaction-details">
            <h3>Niveau de satisfaction</h3>
            <p 
              className="satisfaction-level"
              style={{ color: satisfaction.color }}
            >
              {satisfaction.text}
            </p>
            <p className="completion-time">
              Soumis le {new Date(evaluationResult.completedAt).toLocaleString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{evaluationResult.responses.length}</div>
            <div className="stat-label">Réponses données</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {evaluationData.estimatedTime}
            </div>
            <div className="stat-label">Temps estimé</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">✓</div>
            <div className="stat-label">Évaluation terminée</div>
          </div>
        </div>
      </div>

      {/* Thank you message */}
      <div className="thank-you-message">
        <h3>📚 Votre avis compte !</h3>
        <p>
          Vos commentaires nous aident à améliorer la qualité de nos cours et à offrir 
          une meilleure expérience d'apprentissage. Merci d'avoir pris le temps de 
          partager vos retours avec nous !
        </p>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button
          className="detailed-results-btn"
          onClick={() => setShowDetailedResponses(!showDetailedResponses)}
        >
          {showDetailedResponses ? 'Masquer' : 'Voir'} les réponses détaillées
        </button>

        <div className="action-buttons">
          {onRetry && (
            <button className="retry-evaluation-btn" onClick={onRetry}>
              Modifier les réponses
            </button>
          )}
          <button className="close-evaluation-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>

      {/* Detailed Responses */}
      {showDetailedResponses && (
        <div className="detailed-responses">
          <h3>Réponses détaillées</h3>
          <div className="responses-list">
            {evaluationResult.responses.map((response, index) => {
              const question = evaluationData.questions.find(q => q.id === response.questionId);
              if (!question) return null;

              return (
                <div key={response.questionId} className="response-item">
                  <div className="response-header">
                    <span className="response-number">
                      {getQuestionIcon(question.type)} Q{index + 1}
                    </span>
                    <span className="response-type">{question.type}</span>
                  </div>
                  
                  <div className="response-content">
                    <p className="response-question">{question.question}</p>
                    <div className="response-answer">
                      <strong>Votre réponse :</strong>
                      <span className="answer-value">
                        {formatAnswer(response.answer, question)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="next-steps">
        <h3>🎯 Et maintenant ?</h3>
        <div className="next-steps-grid">
          <div className="next-step-item">
            <div className="step-icon">📖</div>
            <div className="step-content">
              <h4>Continuez votre apprentissage</h4>
              <p>Explorez d'autres modules et cours disponibles</p>
            </div>
          </div>
          <div className="next-step-item">
            <div className="step-icon">🏆</div>
            <div className="step-content">
              <h4>Passez aux examens</h4>
              <p>Testez vos connaissances avec nos exercices</p>
            </div>
          </div>
          <div className="next-step-item">
            <div className="step-icon">👥</div>
            <div className="step-content">
              <h4>Rejoignez la communauté</h4>
              <p>Échangez avec d'autres apprenants</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResults;
