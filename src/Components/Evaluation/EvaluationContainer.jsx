import React, { useState, useEffect } from 'react';
import Evaluation from './Evaluation';
import EvaluationResults from './EvaluationResults';
import './EvaluationContainer.css';

const EvaluationContainer = ({ courseId, lessonId, onEvaluationComplete, onClose }) => {
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchEvaluationData();
  }, [courseId, lessonId]);

  // Mock Data pour l'évaluation
  const fetchEvaluationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Données mock pour l'évaluation
      const mockEvaluationData = {
        id: `eval_${courseId}_${lessonId}`,
        title: 'Évaluation du Cours',
        courseTitle: 'Introduction à la Programmation JavaScript',
        lessonTitle: 'Module 8: Objets de Programmation pour la Récupération de Données',
        description: 'Votre avis nous aide à améliorer la qualité de nos cours. Merci de prendre quelques minutes pour évaluer cette leçon.',
        questions: [
          {
            id: 1,
            question: 'Comment évaluez-vous la clarté du contenu de ce cours ?',
            type: 'rating',
            scale: 5,
            required: true
          },
          {
            id: 2,
            question: 'Le rythme du cours était-il approprié ?',
            type: 'multiple_choice',
            options: [
              'Trop lent',
              'Un peu lent',
              'Parfait',
              'Un peu rapide',
              'Trop rapide'
            ],
            required: true
          },
          {
            id: 3,
            question: 'Quelle a été la difficulté de ce cours pour vous ?',
            type: 'rating',
            scale: 5,
            labels: {
              1: 'Très facile',
              2: 'Facile',
              3: 'Moyen',
              4: 'Difficile',
              5: 'Très difficile'
            },
            required: true
          },
          {
            id: 4,
            question: 'Recommanderiez-vous ce cours à d\'autres étudiants ?',
            type: 'boolean',
            required: true
          },
          {
            id: 5,
            question: 'Qu\'est-ce que vous avez le plus apprécié dans ce cours ?',
            type: 'multiple_choice',
            multiple: true,
            options: [
              'Explications claires',
              'Exemples pratiques',
              'Exercices interactifs',
              'Support visuel',
              'Progression logique',
              'Ressources additionnelles'
            ],
            required: false
          },
          {
            id: 6,
            question: 'Comment évaluez-vous la qualité des supports pédagogiques ?',
            type: 'rating',
            scale: 5,
            required: true
          },
          {
            id: 7,
            question: 'Quels sujets aimeriez-vous voir approfondis ?',
            type: 'text',
            multiline: true,
            placeholder: 'Partagez vos suggestions pour améliorer ce cours...',
            required: false
          },
          {
            id: 8,
            question: 'Avez-vous rencontré des difficultés techniques ?',
            type: 'boolean',
            required: true
          },
          {
            id: 9,
            question: 'Si oui, décrivez les problèmes rencontrés:',
            type: 'text',
            multiline: true,
            placeholder: 'Décrivez les problèmes techniques rencontrés...',
            dependsOn: { questionId: 8, value: true },
            required: false
          },
          {
            id: 10,
            question: 'Note globale du cours',
            type: 'rating',
            scale: 10,
            labels: {
              1: '1 - Très insatisfait',
              10: '10 - Excellent'
            },
            required: true
          }
        ],
        estimatedTime: '5 minutes'
      };

      setEvaluationData(mockEvaluationData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching evaluation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationComplete = async (responses) => {
    try {
      console.log('Evaluation responses:', responses);

      // Traitement des réponses
      const processedResponses = responses.map(response => ({
        questionId: response.questionId,
        answer: response.answer,
        question: evaluationData.questions.find(q => q.id === response.questionId)?.question
      }));

      // Calcul d'un score de satisfaction global
      const ratingQuestions = processedResponses.filter(r => {
        const question = evaluationData.questions.find(q => q.id === r.questionId);
        return question?.type === 'rating';
      });

      const averageRating = ratingQuestions.length > 0 
        ? ratingQuestions.reduce((sum, r) => sum + r.answer, 0) / ratingQuestions.length
        : 0;

      const result = {
        courseId,
        lessonId,
        responses: processedResponses,
        averageRating: Math.round(averageRating * 100) / 100,
        completedAt: new Date().toISOString(),
        submittedBy: 'current_user' // À remplacer par l'ID utilisateur réel
      };

      setEvaluationResult(result);
      setHasSubmitted(true);
      setShowResults(true);

      // Simuler l'envoi à l'API
      console.log('Sending evaluation to API:', result);
      
      if (onEvaluationComplete) {
        onEvaluationComplete(result);
      }

    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError('Erreur lors de la soumission de l\'évaluation');
    }
  };

  const handleCloseEvaluation = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleRetryEvaluation = () => {
    setShowResults(false);
    setEvaluationResult(null);
    setHasSubmitted(false);
  };

  if (isLoading) {
    return (
      <div className="evaluation-container-overlay">
        <div className="evaluation-loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de l'évaluation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evaluation-container-overlay">
        <div className="evaluation-error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchEvaluationData}>
            Réessayer
          </button>
          <button className="close-btn" onClick={handleCloseEvaluation}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-container-overlay">
      {!showResults ? (
        <div className="evaluation-wrapper">
          <Evaluation
            evaluationData={evaluationData}
            onComplete={handleEvaluationComplete}
            onClose={handleCloseEvaluation}
          />
        </div>
      ) : (
        <div className="evaluation-results-wrapper">
          <EvaluationResults
            evaluationResult={evaluationResult}
            evaluationData={evaluationData}
            onRetry={!hasSubmitted ? handleRetryEvaluation : null}
            onClose={handleCloseEvaluation}
          />
        </div>
      )}
    </div>
  );
};

export default EvaluationContainer;
