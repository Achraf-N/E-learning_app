# Exam System with SurveyJS

A comprehensive exam system built with React and SurveyJS that supports multiple question types including MCQ, True/False, and Resolution questions.

## Features

- ✅ **Multiple Choice Questions (MCQ)** - Single correct answer selection
- ✅ **True/False Questions** - Binary choice questions
- ✅ **Resolution/Essay Questions** - Text-based answers
- ✅ **Timer with Auto-submit** - Configurable time limits
- ✅ **Progress Tracking** - Visual progress indicator
- ✅ **Detailed Results** - Comprehensive score breakdown
- ✅ **Responsive Design** - Works on all devices
- ✅ **Retake Functionality** - Option to retake exams
- ✅ **API Integration Ready** - Easy backend integration

## Components

### 1. ExamContainer

The main wrapper component that manages the exam flow and API integration.

```jsx
import { ExamContainer } from './Components/Exams';

<ExamContainer
  courseId="course-123"
  lessonId="lesson-456"
  onExamComplete={(result) => console.log('Exam completed:', result)}
  onClose={() => setShowExam(false)}
/>;
```

### 2. Exam

The core exam component that renders the questions using SurveyJS.

### 3. ExamResults

Displays detailed exam results with score breakdown and question review.

### 4. ExamDemo

A demonstration component showing how to integrate the exam system.

## API Integration

### Expected Backend API Structure

The exam system expects the following API endpoints:

#### 1. Fetch Exam Data

```
GET /api/exams/{courseId}/{lessonId}
```

**Response Format:**

```json
{
  "title": "Auto Exam",
  "questions": [
    {
      "id": 1,
      "question": "Q1: What does Module 8 in the learning material focus on?",
      "type": "mcq",
      "answer": "C",
      "options": [
        "A) Graphics programming",
        "B) Game development",
        "C) Data retrieval using programming objects",
        "D) Web design"
      ],
      "answerIndex": 2
    },
    {
      "id": 2,
      "question": "Q2: The Module 8 covers the use of programming objects for data retrieval.",
      "type": "true_false",
      "answer": "True"
    },
    {
      "id": 3,
      "question": "Q3: What are views and how are they used in the recovery of data?",
      "type": "resolution",
      "answer": "In the context of programming objects, views are stored queries that produce a virtual table..."
    }
  ],
  "total_questions": 3
}
```

#### 2. Submit Exam Results

```
POST /api/exams/submit
```

**Request Body:**

```json
{
  "courseId": "course-123",
  "lessonId": "lesson-456",
  "result": {
    "score": 8,
    "totalQuestions": 11,
    "percentage": 73,
    "answers": [
      {
        "questionId": 1,
        "userAnswer": "C",
        "correctAnswer": "C",
        "isCorrect": true
      }
    ],
    "completedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Question Types

### 1. MCQ (Multiple Choice)

```json
{
  "id": 1,
  "question": "What is the capital of France?",
  "type": "mcq",
  "answer": "C",
  "options": ["A) London", "B) Berlin", "C) Paris", "D) Madrid"],
  "answerIndex": 2
}
```

### 2. True/False

```json
{
  "id": 2,
  "question": "The Earth is round.",
  "type": "true_false",
  "answer": "True"
}
```

### 3. Resolution (Essay)

```json
{
  "id": 3,
  "question": "Explain the benefits of using stored procedures.",
  "type": "resolution",
  "answer": "Stored procedures offer several advantages including..."
}
```

## Usage Examples

### Basic Integration

```jsx
import React, { useState } from 'react';
import { ExamContainer } from './Components/Exams';

function CoursePage() {
  const [showExam, setShowExam] = useState(false);

  const handleExamComplete = (result) => {
    console.log('Exam completed:', result);
    // Handle exam completion (save to database, show results, etc.)
  };

  return (
    <div>
      <button onClick={() => setShowExam(true)}>Start Exam</button>

      {showExam && (
        <ExamContainer
          courseId="course-123"
          lessonId="lesson-456"
          onExamComplete={handleExamComplete}
          onClose={() => setShowExam(false)}
        />
      )}
    </div>
  );
}
```

### Custom Styling

The exam components use CSS custom properties for easy theming:

```css
.sv-root-modern {
  --sjs-primary-backcolor: #667eea;
  --sjs-primary-forecolor: #ffffff;
  --sjs-border-radius: 8px;
  --sjs-font-size: 16px;
}
```

## Configuration Options

### Exam Timer

Set the exam time limit in the `Exam.jsx` component:

```jsx
maxTimeToFinish: 3600, // 1 hour in seconds
```

### Question Display

Configure question display options in the SurveyJS model:

```jsx
showProgressBar: 'bottom',
showQuestionNumbers: true,
showTimerPanel: 'top',
firstPageIsStarted: true,
```

## Dependencies

- `survey-core`: Core SurveyJS functionality
- `survey-react-ui`: React UI components for SurveyJS
- `react`: React framework
- `react-dom`: React DOM rendering

## Installation

1. Install SurveyJS dependencies:

```bash
npm install survey-core survey-react-ui
```

2. Import the exam components:

```jsx
import { ExamContainer } from './Components/Exams';
```

3. Use the components in your application as shown in the usage examples.

## Customization

### Adding New Question Types

To add new question types, modify the `createSurveyJson` function in `Exam.jsx`:

```jsx
case 'new_type':
  return {
    ...baseElement,
    type: 'your_surveyjs_type',
    // Add your custom configuration
  };
```

### Custom Result Processing

Modify the `handleExamComplete` function to add custom result processing logic.

### Styling

All components include comprehensive CSS with responsive design. Customize the styles in the respective `.css` files.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This exam system is built on top of SurveyJS and follows the same licensing terms.

