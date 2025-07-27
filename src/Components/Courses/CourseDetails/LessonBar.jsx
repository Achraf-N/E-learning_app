const LessonBar = ({
  lessons,
  courseTitle,
  progress,
  currentView,
  setCurrentView,
  setAboutView,
  lessonStates,
  isLessonUnlocked,
}) => {
  return (
    <aside className="w-72 p-4 bg-white rounded-lg shadow absolute top-0 left-0 z-10 overflow-y-auto h-screen mt-36">
      <h2 className="text-md font-semibold text-gray-800 mb-4">
        {courseTitle}
      </h2>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mb-4">{progress}% COMPLETE</p>

      <div
        className={`p-2 rounded mb-1 cursor-pointer ${
          currentView === 'about'
            ? 'bg-blue-100 border-l-4 border-blue-500'
            : 'hover:bg-gray-100'
        }`}
        onClick={setAboutView}
      >
        <span className="text-sm text-gray-700">📘 About This Course</span>
      </div>

      {lessons
        .sort((a, b) => a.orderindex - b.orderindex) // Sort by order index
        .map((lesson) => {
          const lessonState = lessonStates.find((l) => l.id === lesson.id);
          const completed = lessonState?.completed === true;
          const unlocked = isLessonUnlocked
            ? isLessonUnlocked(lesson.id)
            : true;
          const isActive = currentView === lesson.id;

          return (
            <div
              key={lesson.id}
              className={`p-2 rounded mb-1 relative ${
                !unlocked
                  ? 'bg-gray-50 cursor-not-allowed opacity-60'
                  : completed
                  ? 'bg-green-50 border-l-4 border-green-500 cursor-pointer'
                  : isActive
                  ? 'bg-blue-100 border-l-4 border-blue-500 cursor-pointer'
                  : 'hover:bg-gray-100 cursor-pointer'
              }`}
              onClick={() => unlocked && setCurrentView(lesson.id)}
              title={
                !unlocked
                  ? 'Complete the previous lesson to unlock'
                  : completed
                  ? 'Lesson completed'
                  : ''
              }
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[20px]">
                    {lesson.orderindex}
                  </span>
                  <span
                    className={`text-sm ${
                      !unlocked
                        ? 'text-gray-400'
                        : completed
                        ? 'text-green-700 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {lesson.title}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {!unlocked && (
                    <span className="text-gray-400 text-sm" title="Locked">
                      🔒
                    </span>
                  )}
                  {completed && (
                    <span
                      className="text-green-500 text-lg font-bold"
                      title="Completed"
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </aside>
  );
};

export default LessonBar;
