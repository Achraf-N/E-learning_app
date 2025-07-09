import React from 'react';
import { useParams } from 'react-router-dom';
import LessonData from './../data/Lessons.json';

const CourseLessons = () => {
  const { courseId } = useParams();
  const lessons = LessonData.filter((lesson) => lesson.courseId == courseId);
  return <div></div>;
};

export default CourseLessons;
