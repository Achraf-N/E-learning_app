import React, { useState } from 'react';
import EvaluationContainer from './EvaluationContainer';
import './EvaluationDemo.css';

const EvaluationDemo = () => {
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleEvaluationComplete = (result) => {
    console.log('Evaluation completed:', result);
    setLastResult(result);
  };

  const handleStartEvaluation = () => {
    setShowEvaluation(true);
  };

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);
  };

  return (
    <div className="evaluation-demo-container">
      <div className="evaluation-demo-header">
        <h1>🌟 Système d'Évaluation des Cours</h1>
        <p className="demo-subtitle">
          Évaluez la qualité de nos cours et aidez-nous à améliorer votre expérience d'apprentissage
        </p>
      </div>

      <div className="demo-content">
        <div className="demo-description">
          <h2>Pourquoi évaluer nos cours ?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">📈</div>
              <h3>Amélioration continue</h3>
              <p>Vos commentaires nous aident à améliorer constamment la qualité de nos contenus pédagogiques.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <h3>Personnalisation</h3>
              <p>Adaptez votre expérience d'apprentissage en nous faisant savoir ce qui fonctionne le mieux pour vous.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">👥</div>
              <h3>Communauté</h3>
              <p>Partagez votre expérience pour aider d'autres apprenants à choisir les meilleurs cours.</p>
            </div>
          </div>
        </div>

        <div className="demo-actions">
          <div className="course-preview">
            <h3>📚 Module 8: Objets de Programmation</h3>
            <p><strong>Cours :</strong> Introduction à la Programmation JavaScript</p>
            <p><strong>Durée :</strong> 2h 30min</p>
            <p><strong>Niveau :</strong> Intermédiaire</p>
            <div className="course-topics">
              <span className="topic-tag">Views</span>
              <span className="topic-tag">Fonctions utilisateur</span>
              <span className="topic-tag">Procédures stockées</span>
              <span className="topic-tag">Triggers</span>
            </div>
          </div>

          <button className="start-evaluation-btn" onClick={handleStartEvaluation}>
            ⭐ Évaluer ce cours
          </button>
        </div>

        {lastResult && (
          <div className="last-evaluation">
            <h3>Dernière évaluation</h3>
            <div className="evaluation-summary">
              <div className="summary-item">
                <span className="summary-label">Note moyenne :</span>
                <span className="summary-value">{lastResult.averageRating.toFixed(1)}/5.0</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Réponses :</span>
                <span className="summary-value">{lastResult.responses.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date :</span>
                <span className="summary-value">
                  {new Date(lastResult.completedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="features-list">
          <h3>Fonctionnalités de l'évaluation</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span>Notation par étoiles</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Questions à choix multiples</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Questions oui/non</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span>Commentaires libres</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Design responsive</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span>Navigation par pages</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Résultats détaillés</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Soumission rapide</span>
            </div>
          </div>
        </div>
      </div>

      {showEvaluation && (
        <EvaluationContainer
          courseId="course_js_intro"
          lessonId="module_8_programming_objects"
          onEvaluationComplete={handleEvaluationComplete}
          onClose={handleCloseEvaluation}
        />
      )}
    </div>
  );
};

export default EvaluationDemo;
