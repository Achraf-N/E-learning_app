import React, { useState, useEffect } from 'react';
import Exam from './Exam';
import ExamResults from './ExamResults';
import './ExamContainer.css';

const ExamContainer = ({ courseId, lessonId, onExamComplete, onClose }) => {
  const [examData, setExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const token = localStorage.getItem('access_token');
  useEffect(() => {
    fetchExamData();
  }, [courseId, lessonId]);

  useEffect(() => {
    if (examData) {
      setStartTime(Date.now()); // start timer when exam loads
    }
  }, [examData]);

  /*
  //mock Data
  const fetchExamData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for demonstration - replace with actual API call
      const mockExamData = {
        title: 'Auto Exam',
        questions: [
          {
            id: 1,
            question:
              'Q1: What does Module 8 in the learning material focus on?',
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

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setExamData(mockExamData);

      // Uncomment the following code to use actual API:
      // const response = await fetch(`/api/exams/${courseId}/${lessonId}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch exam data');
      // }
      // const data = await response.json();
      // setExamData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching exam data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  */
  const fetchExamData = async (version = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/exams/module/${courseId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 🔑 send token here
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch exam data: ${response.status}`);
      }
      // Check for invalid/missing questions

      const data = await response.json();
      const exam = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!exam) {
        throw new Error('No exam found for this module');
      }
      const hasInvalid = exam.content.questions.some(
        (q) =>
          !q.question ||
          q.question.toLowerCase().includes('manquante') ||
          q.question.toLowerCase().includes('non traité')
      );

      if (hasInvalid) {
        const altResponse = await fetch(
          `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/alternative-exam/${courseId}?version=${version}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!altResponse.ok)
          throw new Error('Failed to fetch alternative exam');

        const altData = await altResponse.json();

        if (altData) {
          //exam.title = altData[0].title;
          exam.content = altData.content; // replace exam with alternative
          console.log('after insert aternative exam in exam component');
          console.log(exam);
        }
      }

      const transformedExam = {
        id: exam.id,
        module_id: exam.module_id,
        score: exam.score,
        status: exam.status,
        title: exam.content.title,
        questions: exam.content.questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options || [],
          answer: q.answer,
          answerIndex: q.answerIndex ?? null,
        })),
        total_questions: exam.total_questions,
        answers: exam.user_answer || [],
        completedAt: exam.completed_at,
        attempt_number: exam.attempt_number || 1,
      };

      setExamData(transformedExam);
      if (exam.status === 'passed') {
        setExamResult({
          totalPointsEarned: exam.score,
          totalMaxPoints: 20,
          finalGrade20: exam.score,
          answers: exam.user_answer || [],
          completedAt: exam.completedAt,
        });
        setShowResults(true);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching exam data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to call the scoring API
  const scoreResolutionAnswer = async (
    questionId,
    studentAnswer,
    modelAnswer
  ) => {
    try {
      const response = await fetch(
        'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/resolution/score-resolution',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionId, studentAnswer, modelAnswer }),
        }
      );
      return await response.json(); // { questionId, score, similarity }
    } catch (err) {
      console.error('Error scoring resolution:', err);
      return { score: 0 };
    }
  };

  const handleExamComplete = async (result) => {
    try {
      const endTime = Date.now();
      const timeSpentSeconds = startTime
        ? Math.floor((endTime - startTime) / 1000)
        : 0;

      const processedAnswers = await Promise.all(
        result.answers.map(async (answer) => {
          const question = examData.questions.find(
            (q) => q.id === answer.questionId
          );
          if (question.type === 'mcq') {
            // Use index or letter comparison as we fixed earlier
            let correct = false;

            if (typeof answer.userAnswer === 'number') {
              correct = answer.userAnswer === question.answerIndex;
            } else if (typeof answer.userAnswer === 'string') {
              const userIndex = question.options.findIndex(
                (opt) => opt === answer.userAnswer
              );
              correct = userIndex === question.answerIndex;
            }

            return {
              ...answer,
              isCorrect: correct,
              pointsEarned: correct ? 1 : 0,
            };
          }

          if (question.type === 'true_false') {
            // Simply compare strings "True" / "False"
            const correct = answer.userAnswer === question.answer;
            return {
              ...answer,
              isCorrect: correct,
              pointsEarned: correct ? 1 : 0,
            };
          }

          if (question.type === 'resolution') {
            const scoreData = await scoreResolutionAnswer(
              question.id,
              answer.userAnswer,
              question.answer
            );

            // Decide points based on similarity
            let earned = 0;
            if (scoreData.score >= 80) earned = 5;
            else if (scoreData.score >= 50) earned = 2.5;
            else earned = 0;

            return {
              ...answer,
              similarity: scoreData.score,
              pointsEarned: earned,
              isCorrect: earned > 0,
            };
          }

          return answer;
        })
      );
      console.log(examData);
      // Total points possible
      const totalMaxPoints = examData.questions.reduce((sum, q) => {
        if (q.type === 'resolution') return sum + 5;
        return sum + 1; // mcq and t/f
      }, 0);

      // Total earned
      const totalPointsEarned = processedAnswers.reduce(
        (sum, a) => sum + (a.pointsEarned || 0),
        0
      );

      // Grade out of 20
      const finalGrade20 = Math.round(
        (totalPointsEarned / totalMaxPoints) * 20
      );

      const finalResult = {
        answers: processedAnswers,
        totalPointsEarned,
        totalMaxPoints,
        finalGrade20,
        completedAt: new Date().toISOString(),
      };
      console.log('Final exam result:', finalResult);
      setExamResult(finalResult);
      setShowResults(true);
      // 🔹 SAVE RESULTS TO POSTGRES
      if (examData.id && examData.status !== 'passed') {
        console.log('Saving exam results to server...', processedAnswers);
        await fetch(
          `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/exams/update/${examData.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              score: finalGrade20,
              correct_answers: processedAnswers.filter((a) => a.isCorrect)
                .length,
              total_questions: processedAnswers.length,
              time_spent: timeSpentSeconds || 0,
              status: finalGrade20 >= 10 ? 'passed' : 'failed',
              user_answer: processedAnswers,
            }),
          }
        );
      }
      if (examData.module_id) {
        await fetch(
          `https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/userprogress/${examData.module_id}/complete`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Error scoring exam:', err);
      // fallback...
    }
  };

  const handleRetakeExam = () => {
    setShowResults(false);
    setExamResult(null);
    // Optionally fetch new exam data
    fetchExamData(examData.attempt_number + 1);
  };

  const handleCloseResults = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleCloseExam = () => {
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="exam-container-overlay">
        <div className="exam-loading-container">
          <div className="loading-spinner"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-container-overlay">
        <div className="exam-error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Exam</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchExamData}>
            Try Again
          </button>
          <button className="close-btn" onClick={handleCloseExam}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showResults && examResult) {
    return (
      <div className="exam-container-overlay">
        <div className="exam-results-wrapper">
          <ExamResults
            examResult={examResult}
            examData={examData}
            onRetakeExam={handleRetakeExam}
            onCloseResults={handleCloseResults}
          />
        </div>
      </div>
    );
  }

  if (examData) {
    return (
      <div className="exam-container-overlay">
        <div className="exam-wrapper">
          <Exam
            examData={examData}
            onExamComplete={handleExamComplete}
            onExamClose={handleCloseExam}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default ExamContainer;
