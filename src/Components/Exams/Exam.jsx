import React, { useState, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';
import './Exam.css';

const Exam = ({ examData, onExamComplete, onExamClose }) => {
  const [survey, setSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    if (examData) {
      initializeExam();
    }
  }, [examData]);

  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleExamComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const initializeExam = () => {
    const surveyModel = new Model(createSurveyJson());
    surveyModel.onComplete.add(handleExamComplete);
    surveyModel.onValueChanged.add(handleAnswerChange);

    setSurvey(surveyModel);
    setIsLoading(false);
  };

  const createSurveyJson = () => {
    const elements = examData.questions.map((question) => {
      const baseElement = {
        name: `question_${question.id}`,
        title: question.question,
        isRequired: true,
      };

      switch (question.type) {
        case 'mcq':
          return {
            ...baseElement,
            type: 'radiogroup',
            choices: question.options,
            correctAnswer: question.answer,
          };

        case 'true_false':
          return {
            ...baseElement,
            type: 'radiogroup',
            choices: ['True', 'False'],
            correctAnswer: question.answer,
          };

        case 'resolution':
          return {
            ...baseElement,
            type: 'comment',
            rows: 6,
            placeholder: 'Write your detailed answer here...',
            correctAnswer: question.answer,
          };

        default:
          return baseElement;
      }
    });

    return {
      title: examData.title,
      description: `Total Questions: ${examData.total_questions}`,
      elements: elements,
      showProgressBar: 'bottom',
      showQuestionNumbers: true,
      showTimerPanel: 'top',
      maxTimeToFinish: 3600, // 1 hour
      firstPageIsStarted: true,
      startSurveyText: 'Start Exam',
      completeText: 'Submit Exam',
      pageNextText: 'Next',
      pagePrevText: 'Previous',
      questionTitleTemplate: '{noOfQuestion}. {title}',
      questionErrorLocation: 'bottom',
      showCompletedBeforeHtml: false,
      showPreviewBeforeComplete: 'showAnsweredQuestions',
    };
  };

  const handleAnswerChange = (sender, options) => {
    // Handle answer changes if needed
    console.log('Answer changed:', options.name, options.value);
  };

  const handleExamComplete = (sender, options) => {
    const results = sender.data;
    const answers = Object.keys(results).map((questionName) => {
      const questionId = questionName.replace('question_', '');
      const question = examData.questions.find(
        (q) => q.id.toString() === questionId
      );
      return {
        questionId: parseInt(questionId),
        userAnswer: results[questionName],
        correctAnswer: question?.answer,
        isCorrect: question?.answer === results[questionName],
      };
    });

    const score = answers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = examData.total_questions;
    const percentage = Math.round((score / totalQuestions) * 100);

    const examResult = {
      score,
      totalQuestions,
      percentage,
      answers,
      completedAt: new Date().toISOString(),
    };

    onExamComplete(examResult);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="exam-loading">
        <div className="loading-spinner"></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>{examData.title}</h2>
        <div className="exam-info">
          <span>Questions: {examData.total_questions}</span>
          {timeLeft !== null && (
            <span className="timer">Time Left: {formatTime(timeLeft)}</span>
          )}
        </div>
        <button className="close-exam-btn" onClick={onExamClose}>
          ✕
        </button>
      </div>

      <div className="exam-content">
        <Survey model={survey} />
      </div>
    </div>
  );
};

export default Exam;
