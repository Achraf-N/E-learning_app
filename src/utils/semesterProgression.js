/**
 * Semester Progression Utility Functions
 * Handles logic for course unlocking based on semester completion
 */

// Dynamic semester order - will be determined from actual data
export const SEMESTER_ORDER = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export const SEMESTER_NAMES = {
  S1: 'First Semester',
  S2: 'Second Semester',
  S3: 'Third Semester',
  S4: 'Fourth Semester',
  S5: 'Fifth Semester',
  S6: 'Sixth Semester',
};

/**
 * Check if a semester is accessible based on previous semester completions
 * @param {string} targetSemester - The semester to check (e.g., 'S2')
 * @param {Object} semesterCompletions - Object with semester completion status
 * @returns {boolean} - Whether the semester is accessible
 */
export const isSemesterAccessible = (targetSemester, semesterCompletions) => {
  // S1 is always accessible
  if (targetSemester === 'S1') return true;

  const targetIndex = SEMESTER_ORDER.indexOf(targetSemester);
  if (targetIndex === -1) return false;
  if (targetIndex === 0) return true; // First semester in order is always accessible

  // Check if all previous semesters are completed
  for (let i = 0; i < targetIndex; i++) {
    const previousSemester = SEMESTER_ORDER[i];
    if (!semesterCompletions[previousSemester]) {
      return false;
    }
  }

  return true;
};

/**
 * Get the highest accessible semester for a user
 * @param {Object} semesterCompletions - Object with semester completion status
 * @returns {string} - The highest accessible semester
 */
export const getHighestAccessibleSemester = (semesterCompletions) => {
  let highestSemester = 'S1';

  for (const semester of SEMESTER_ORDER) {
    if (isSemesterAccessible(semester, semesterCompletions)) {
      highestSemester = semester;
    } else {
      break;
    }
  }

  return highestSemester;
};

/**
 * Calculate completion percentage for a semester
 * @param {Array} courses - Array of courses in the semester
 * @param {Object} userProgress - User's progress data
 * @returns {number} - Completion percentage (0-100)
 */
export const calculateSemesterCompletionPercentage = (
  courses,
  userProgress
) => {
  if (courses.length === 0) return 100;

  const completedCount = courses.filter((course) => {
    const progress = userProgress[course.id];
    return progress && progress.progress_percentage === 100;
  }).length;

  return Math.round((completedCount / courses.length) * 100);
};

/**
 * Get the next semester that needs to be unlocked
 * @param {Object} semesterCompletions - Object with semester completion status
 * @returns {string|null} - Next semester to unlock or null if all completed
 */
export const getNextSemesterToUnlock = (semesterCompletions) => {
  for (const semester of SEMESTER_ORDER) {
    if (!semesterCompletions[semester]) {
      return semester;
    }
  }
  return null; // All semesters completed
};

/**
 * Get a user-friendly message for why a course is locked
 * @param {string} courseSemester - The semester of the locked course
 * @param {Object} semesterCompletions - Object with semester completion status
 * @returns {string} - User-friendly message
 */
export const getCourseLockMessage = (courseSemester, semesterCompletions) => {
  const courseSemesterIndex = SEMESTER_ORDER.indexOf(courseSemester);

  for (let i = 0; i < courseSemesterIndex; i++) {
    const requiredSemester = SEMESTER_ORDER[i];
    if (!semesterCompletions[requiredSemester]) {
      return `Complete all ${SEMESTER_NAMES[requiredSemester]} courses to unlock this course`;
    }
  }

  return `Complete previous semesters to access ${SEMESTER_NAMES[courseSemester]} courses`;
};

/**
 * Check if user can enroll in a specific course
 * @param {Object} course - Course object with semester info
 * @param {Object} semesterCompletions - Object with semester completion status
 * @param {Object} userProgress - User's current progress
 * @returns {Object} - { canEnroll: boolean, reason: string }
 */
export const checkCourseEnrollmentEligibility = (
  course,
  semesterCompletions,
  userProgress
) => {
  const courseSemester = course.semester || 'S1';

  // Check if course is already completed
  const progress = userProgress[course.id];
  if (progress && progress.progress_percentage === 100) {
    return { canEnroll: false, reason: 'Course already completed' };
  }

  // Check semester accessibility
  if (!isSemesterAccessible(courseSemester, semesterCompletions)) {
    return {
      canEnroll: false,
      reason: getCourseLockMessage(courseSemester, semesterCompletions),
    };
  }

  // Check course prerequisites if any
  if (course.prerequisites && course.prerequisites.length > 0) {
    const unmetPrerequisites = course.prerequisites.filter((prereqId) => {
      const prereqProgress = userProgress[prereqId];
      return !prereqProgress || prereqProgress.progress_percentage < 100;
    });

    if (unmetPrerequisites.length > 0) {
      return {
        canEnroll: false,
        reason: `Complete prerequisite courses first: ${unmetPrerequisites.join(
          ', '
        )}`,
      };
    }
  }

  return { canEnroll: true, reason: 'Course is available' };
};
