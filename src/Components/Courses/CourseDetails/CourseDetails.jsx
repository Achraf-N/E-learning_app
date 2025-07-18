import React from 'react';
import { useParams } from 'react-router-dom';
import CourseData from './../data/Courses.json';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Title } from '../../../GeneralFunctions/title';
import { useTranslation } from 'react-i18next';
import CourseLessons from '../CourseLessons/CourseLessons';
import LessonBar from './LessonBar';
import { useEffect, useState } from 'react';

const CourseDetails = () => {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch('http://localhost:8080/modules/full');
        if (!response.ok) {
          throw new Error('Failed to fetch course data');
        }
        const modules = await response.json();
        const selectedCourse = modules.find((module) => module.id === courseId);
        setCourse(selectedCourse);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div>{t('error_loading_course')}</div>;
  }

  if (!course) {
    return <div>{t('course_not_found')}</div>;
  }

  return (
    <div>
      <div className="container">
        <div className="mt-20 mb-16 md:mb-32 text-center">
          <h1 className="font-bold">{t('lessons')}</h1>
          <LessonBar
            lessons={course.lessons}
            courseTitle={course.name}
            about={course.about}
          />
        </div>
        <div className="flex flex-wrap justify-center">
          <div className="w-full md:w-2/3 lg:w-2/3 xl:w-2/3 p-4">
            <CourseLessons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
