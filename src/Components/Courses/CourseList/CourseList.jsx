import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../../../config/api';
import {
  isSemesterAccessible,
  getHighestAccessibleSemester,
  calculateSemesterCompletionPercentage,
  checkCourseEnrollmentEligibility,
  SEMESTER_ORDER,
  SEMESTER_NAMES,
} from '../../../utils/semesterProgression';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { jwtDecode } from 'jwt-decode';

const CoursList = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [currentSemester, setCurrentSemester] = useState('S1');
  const [semesterCompletion, setSemesterCompletion] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    // Fetch courses first, then progress data
    const fetchData = async () => {
      await fetchCourses();

      if (token) {
        await initializeUserProgressIfNeeded();
        await fetchUserProgress();
        await checkSemesterCompletions();
      }
    };

    fetchData();
  }, []);

  // Add event listener for progress updates
  useEffect(() => {
    const handleProgressUpdate = () => {
      if (isLoggedIn) {
        fetchUserProgress();
        checkSemesterCompletions();
      }
    };

    // Listen for custom events when progress is updated
    window.addEventListener('progressUpdated', handleProgressUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, [isLoggedIn]);

  const initializeUserProgressIfNeeded = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = token ? jwtDecode(token).sub : null;

      if (!userId || !token) return;

      // Initialize user progress if they're new
      await fetch(API_CONFIG.MODULE_PROGRESS.INITIALIZE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });
    } catch (error) {
      console.log('User progress already initialized or error:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/modules/full'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();

      // Transform the API data using the semester field from PostgreSQL
      const transformedData = data.map((course) => ({
        id: course.id,
        image: course.image,
        name: course.name || course.title,
        name_fr: course.name_fr,
        name_ar: null,
        description: course.description,
        description_fr: course.description_fr,
        description_ar: null,
        semester: course.semester, // Use the semester from PostgreSQL
        difficulty_level: course.difficulty_level || 'beginner',
        prerequisites: course.prerequisites || [],
        code: course.code,
        about_en: course.about_en,
        about_fr: course.about_fr,
        order: course.order,
      }));

      setCourses(transformedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = token ? jwtDecode(token).sub : null;

      if (!userId) return;

      const response = await fetch(
        API_CONFIG.MODULE_PROGRESS.GET_BY_USER(userId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Convert array to object for easier lookup
        const progressMap = {};
        data.forEach((progress) => {
          progressMap[progress.module_id] = progress;
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const checkSemesterCompletions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = token ? jwtDecode(token).sub : null;

      if (!userId) return;

      // Get all available semesters from courses
      const availableSemesters = [
        ...new Set(courses.map((course) => course.semester)),
      ]
        .filter(Boolean)
        .sort();
      const completionStatus = {};

      // If no courses loaded yet, fallback to defaults
      const semestersToCheck =
        availableSemesters.length > 0
          ? availableSemesters
          : ['S1', 'S2', 'S3', 'S4'];

      for (const semester of semestersToCheck) {
        try {
          const response = await fetch(
            API_CONFIG.MODULE_PROGRESS.CHECK_SEMESTER_COMPLETION(
              userId,
              semester
            ),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            completionStatus[semester] = data.completed || false;
          } else {
            // If endpoint doesn't exist, calculate manually
            completionStatus[semester] = calculateSemesterCompletion(semester);
          }
        } catch (error) {
          // Fallback to manual calculation
          console.log(
            `Calculating ${semester} completion manually:`,
            error.message
          );
          completionStatus[semester] = calculateSemesterCompletion(semester);
        }
      }

      setSemesterCompletion(completionStatus);

      // Determine current accessible semester using utility function
      const currentAccessibleSemester =
        getHighestAccessibleSemester(completionStatus);
      setCurrentSemester(currentAccessibleSemester);
    } catch (error) {
      console.error('Error checking semester completions:', error);
      // Initialize with S1 accessible if there's an error
      const fallbackCompletion = { S1: false }; // S1 is accessible but not completed initially
      setSemesterCompletion(fallbackCompletion);
      setCurrentSemester('S1');
    }
  };

  const calculateSemesterCompletion = (semester) => {
    const semesterCourses = courses.filter(
      (course) => course.semester === semester
    );
    return (
      calculateSemesterCompletionPercentage(semesterCourses, userProgress) ===
      100
    );
  };

  const isCourseAccessible = (course) => {
    if (!isLoggedIn) return true; // Allow viewing for non-logged users

    const eligibility = checkCourseEnrollmentEligibility(
      course,
      semesterCompletion,
      userProgress
    );
    return (
      eligibility.canEnroll || eligibility.reason === 'Course already completed'
    );
  };

  const getCourseAccessibilityMessage = (course) => {
    if (!isLoggedIn) return null;

    const eligibility = checkCourseEnrollmentEligibility(
      course,
      semesterCompletion,
      userProgress
    );
    return eligibility.canEnroll ? null : eligibility.reason;
  };

  // Helper function to get translated semester name
  const getTranslatedSemesterName = (semester) => {
    const semesterMap = {
      S1: t('first_semester'),
      S2: t('second_semester'),
      S3: t('third_semester'),
      S4: t('fourth_semester'),
      S5: t('fifth_semester'),
      S6: t('sixth_semester'),
    };
    return semesterMap[semester] || `Semester ${semester.slice(1)}`;
  };

  const getLocalizedCourse = (course) => {
    if (i18n.language === 'fr') {
      return {
        id: course.id,
        image: course.image,
        name: course.name_fr,
        description: course.description_fr,
        semester: course.semester,
        difficulty_level: course.difficulty_level,
        prerequisites: course.prerequisites,
      };
    }

    return {
      id: course.id,
      image: course.image,
      name: course.name,
      description: course.description,
      semester: course.semester,
      difficulty_level: course.difficulty_level,
      prerequisites: course.prerequisites,
    };
  };

  // Group courses by semester for better organization
  const groupedCourses = courses.reduce((acc, course) => {
    const semester = course.semester || 'S1';
    if (!acc[semester]) acc[semester] = [];
    acc[semester].push(course);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t('loading_courses')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="container">
          {/* Header Section */}
          <div>
            <div className="w-full xl:px-16 md:mt-20 mt-4 lg:w-10/12">
              <div className="mb-4 font-bold relative before:absolute before:hidden before:xl:block before:h-2 before:w-12 rtl:before:left-[56rem] ltr:before:-left-16 before:bg-third-color before:top-[1.2rem]">
                <h1 className="mb-2">
                  {t('all_courses')}: <br /> {t('find_all')}
                </h1>
              </div>

              {/* Semester Progress Indicator */}
              {isLoggedIn && (
                <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {t('your_learning_path')}
                  </h3>
                  <div className="flex items-center space-x-4 flex-wrap">
                    {Object.keys(groupedCourses)
                      .sort()
                      .map((semester, index, semesters) => {
                        const isCompleted = semesterCompletion[semester];
                        const isCurrent = semester === currentSemester;
                        const isAccessible = isSemesterAccessible(
                          semester,
                          semesterCompletion
                        );

                        return (
                          <div
                            key={semester}
                            className="flex items-center mb-2"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : isCurrent
                                  ? 'bg-blue-500 text-white'
                                  : isAccessible
                                  ? 'bg-yellow-400 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              {isCompleted ? '✓' : semester}
                            </div>
                            <span
                              className={`ml-2 text-sm ${
                                isCompleted
                                  ? 'text-green-700'
                                  : isCurrent
                                  ? 'text-blue-700'
                                  : isAccessible
                                  ? 'text-yellow-700'
                                  : 'text-gray-500'
                              }`}
                            >
                              {getTranslatedSemesterName(semester)}
                              {isCurrent && ` (${t('semester_current')})`}
                            </span>
                            {index < semesters.length - 1 && (
                              <svg
                                className="w-4 h-4 mx-2 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Progress Statistics */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(groupedCourses).map(
                      ([semester, semesterCourses]) => {
                        const completionPercentage =
                          calculateSemesterCompletionPercentage(
                            semesterCourses,
                            userProgress
                          );
                        const completedCount = semesterCourses.filter(
                          (course) => {
                            const progress = userProgress[course.id];
                            return (
                              progress && progress.progress_percentage === 100
                            );
                          }
                        ).length;

                        return (
                          <div key={semester} className="text-center">
                            <div
                              className={`font-medium ${
                                completionPercentage === 100
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {semester}: {completedCount}/
                              {semesterCourses.length}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full ${
                                  completionPercentage === 100
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{
                                  width: `${completionPercentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Courses by Semester */}
          {Object.keys(groupedCourses)
            .sort() // Sort semesters alphabetically (S1, S2, S3, etc.)
            .filter(
              (semester) =>
                groupedCourses[semester] && groupedCourses[semester].length > 0
            )
            .map((semester) => {
              const semesterCourses = groupedCourses[semester];
              const isAccessible = isSemesterAccessible(
                semester,
                semesterCompletion
              );

              return (
                <div key={semester} className="mb-12">
                  {/* Semester Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {getTranslatedSemesterName(semester)} {t('courses')}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {semesterCompletion[semester] && (
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                          ✓ {t('semester_completed')}
                        </span>
                      )}
                      {!isAccessible && (
                        <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                          🔒 {t('semester_locked')}
                        </span>
                      )}
                      {isAccessible && !semesterCompletion[semester] && (
                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                          📚 {t('semester_available')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Slider */}
                  <Swiper
                    breakpoints={{
                      200: { slidesPerView: 1 },
                      550: { slidesPerView: 2 },
                      1023: { slidesPerView: 3 },
                    }}
                    spaceBetween={30}
                    grabCursor={true}
                    className="mySwiper"
                  >
                    {semesterCourses.map((course) => {
                      const localizedCourse = getLocalizedCourse(course);
                      const isAccessible = isCourseAccessible(course);
                      const accessibilityMessage =
                        getCourseAccessibilityMessage(course);
                      const progress = userProgress[course.id];

                      return (
                        <SwiperSlide
                          key={localizedCourse.id}
                          className="md:mt-16 mt-4 pb-16 rounded border shadow relative"
                        >
                          <div
                            className={`relative ${
                              !isAccessible ? 'opacity-60' : ''
                            }`}
                          >
                            {/* Lock Overlay */}
                            {!isAccessible && (
                              <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded flex items-center justify-center z-10">
                                <div className="text-center text-white p-4">
                                  <svg
                                    className="w-12 h-12 mx-auto mb-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <p className="text-sm font-medium">
                                    {accessibilityMessage}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Course Image */}
                            <LazyLoadImage
                              src={localizedCourse.image}
                              effect="blur"
                              alt={localizedCourse.name}
                              className="w-full aspect-[3/2] object-fill"
                            />

                            {/* Progress Bar */}
                            {progress && isLoggedIn && (
                              <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium">
                                {progress.progress_percentage}%
                              </div>
                            )}

                            {/* Course Content */}
                            <div>
                              <h6 className="my-4 font-semibold">
                                {localizedCourse.name}
                              </h6>
                              <p className="text-base w-10/12 my-0 mx-auto">
                                {localizedCourse.description}
                              </p>

                              {/* Course Metadata */}
                              <div className="flex items-center justify-between px-4 mt-4 text-xs text-gray-500">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {localizedCourse.semester}
                                </span>
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  {localizedCourse.difficulty_level}
                                </span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div>
                              {isAccessible ? (
                                <Link
                                  to={`/course-details/${localizedCourse.id}`}
                                >
                                  <button
                                    type="submit"
                                    className="w-full py-2 mt-4"
                                  >
                                    {progress
                                      ? t('continue_learning')
                                      : t('learn_more')}
                                  </button>
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-2 mt-4 bg-gray-300 text-gray-500 cursor-not-allowed"
                                >
                                  🔒 {t('course_locked')}
                                </button>
                              )}
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default CoursList;
