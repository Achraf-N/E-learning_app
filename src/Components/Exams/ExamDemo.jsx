import React, { useState } from 'react';
import ExamContainer from './ExamContainer';
import './ExamDemo.css';

const ExamDemo = () => {
  const [showExam, setShowExam] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Sample exam data matching your API structure
  const sampleExamData = {
    title: 'Auto Exam',
    questions: [
      {
        id: 1,
        question: 'Q1: What does Module 8 in the learning material focus on?',
        type: 'mcq',
        answer: 'C',
        options: [
          'A) Graphics programming',
          'B) Game development',
          'C) Data retrieval using programming objects',
          'D) Web design',
        ],
        answerIndex: 2,
      },
      {
        id: 2,
        question:
          'Q2: Which topic does the first lesson of Module 8 discuss in detail?',
        type: 'mcq',
        answer: 'D',
        options: [
          'A) User-defined functions',
          'B) Triggers',
          'C) Stored procedures',
          'D) Views',
        ],
        answerIndex: 3,
      },
      {
        id: 3,
        question:
          'Q3: What is the primary purpose of a view in the context of Module 8?',
        type: 'mcq',
        answer: 'A',
        options: [
          'A) It presents a virtual table from stored queries',
          'B) It is a special type of stored procedure',
          'C) It is used for reutilizing code within a program',
          'D) It is a way to store data in a database',
        ],
        answerIndex: 0,
      },
      {
        id: 4,
        question:
          'Q4: What advantages does a stored procedure offer in the context of Module 8?',
        type: 'mcq',
        answer: 'A',
        options: [
          'A) It promotes modular programming and reduces network traffic',
          'B) It increases the efficiency of data storage',
          'C) It helps in taking backups of the database',
          'D) It improves the performance of the database',
        ],
        answerIndex: 0,
      },
      {
        id: 5,
        question: 'Q5: What is a trigger in the context of Module 8?',
        type: 'mcq',
        answer: 'C',
        options: [
          'A) A type of view that operates on a virtual table',
          'B) A database backup strategy',
          'C) A special type of stored procedure that automatically executes when certain events occur in the database',
          'D) A way to optimize the flow of data in a database',
        ],
        answerIndex: 2,
      },
      {
        id: 6,
        question:
          'Q1: The Module 8 covers the use of programming objects for data retrieval.',
        type: 'true_false',
        answer: 'True',
      },
      {
        id: 7,
        question:
          'Q2: The first lesson details vues, which are queries that generate a table permanently.',
        type: 'true_false',
        answer: 'False',
      },
      {
        id: 8,
        question:
          'Q3: The second lesson explains the benefits of using user-defined functions, but does not mention code reuse as one of them.',
        type: 'true_false',
        answer: 'True',
      },
      {
        id: 9,
        question:
          'Q4: Procedures stored can be used to reduce the network traffic.',
        type: 'true_false',
        answer: 'True',
      },
      {
        id: 10,
        question:
          'Q1: What are views and how are they used in the recovery of data in the context of programming objects?',
        type: 'resolution',
        answer:
          'In the context of programming objects, views are stored queries that produce a virtual table. They are used to simplify complex database queries, make it easier to work with large amounts of data, and to restrict access to specific subsets of data. Creating a view involves writing a SQL statement that specifies the data to be included in the view and how it should be organized. Views can take into account important factors such as security, performance, and ease of use when they are created. There are different types of views, such as indexed views and partitioned views, which allow for optimal performance and organization of the data in the view.',
      },
      {
        id: 11,
        question:
          'Q2: What are user-defined functions and what are some of the advantages of using them in database programming?',
        type: 'resolution',
        answer:
          'User-defined functions (UDFs) are programming modules that reuse code and logic in a database. They offer several advantages, such as increased code reusability, code modularity, and improved maintainability. UDFs can be created to perform a specific task, such as calculating a financial calculation or formatting data, and can be called multiple times within a database application. They can also help to reduce the amount of code written, make it easier to maintain and update the code, and improve overall performance by reducing the number of times the same code is executed. UDFs can be created in a variety of programming languages such as SQL, PL/SQL, and Java, depending on the database management system being used.',
      },
    ],
    total_questions: 11,
  };

  const handleStartExam = () => {
    setShowExam(true);
    setExamResult(null);
  };

  const handleExamComplete = (result) => {
    setExamResult(result);
    console.log('Exam completed with result:', result);
  };

  const handleCloseExam = () => {
    setShowExam(false);
  };

  return (
    <div className="exam-demo-container">
      <div className="demo-header">
        <h1>Exam System Demo</h1>
        <p>This is a demonstration of the exam system built with SurveyJS</p>
      </div>

      <div className="demo-content">
        <div className="exam-info-card">
          <h2>Exam Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Title:</span>
              <span className="info-value">{sampleExamData.title}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Questions:</span>
              <span className="info-value">
                {sampleExamData.total_questions}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">MCQ Questions:</span>
              <span className="info-value">
                {
                  sampleExamData.questions.filter((q) => q.type === 'mcq')
                    .length
                }
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">True/False Questions:</span>
              <span className="info-value">
                {
                  sampleExamData.questions.filter(
                    (q) => q.type === 'true_false'
                  ).length
                }
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Resolution Questions:</span>
              <span className="info-value">
                {
                  sampleExamData.questions.filter(
                    (q) => q.type === 'resolution'
                  ).length
                }
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Time Limit:</span>
              <span className="info-value">1 hour</span>
            </div>
          </div>
        </div>

        <div className="demo-actions">
          <button
            className="start-exam-btn"
            onClick={handleStartExam}
            disabled={showExam}
          >
            {showExam ? 'Exam in Progress...' : 'Start Demo Exam'}
          </button>

          {examResult && (
            <div className="last-result">
              <h3>Last Exam Result</h3>
              <div className="result-summary">
                <span className="result-score">
                  Score: {examResult.score}/{examResult.totalQuestions}
                </span>
                <span className="result-percentage">
                  ({examResult.percentage}%)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="features-list">
          <h3>Features</h3>
          <ul>
            <li>✅ Multiple Choice Questions (MCQ)</li>
            <li>✅ True/False Questions</li>
            <li>✅ Resolution/Essay Questions</li>
            <li>✅ Timer with auto-submit</li>
            <li>✅ Progress tracking</li>
            <li>✅ Detailed results with breakdown</li>
            <li>✅ Responsive design</li>
            <li>✅ Retake functionality</li>
            <li>✅ API integration ready</li>
          </ul>
        </div>
      </div>

      {showExam && (
        <ExamContainer
          courseId="demo-course"
          lessonId="demo-lesson"
          onExamComplete={handleExamComplete}
          onClose={handleCloseExam}
        />
      )}
    </div>
  );
};

export default ExamDemo;

