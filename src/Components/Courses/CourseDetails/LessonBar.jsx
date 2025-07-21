const LessonBar = ({ lessons, courseTitle, progress, currentView, setCurrentView, lessonStates }) => {
  return (
    <aside className="w-72 p-4 bg-white rounded-lg shadow absolute top-0 left-0 z-10 overflow-y-auto h-screen mt-36">
      <h2 className="text-md font-semibold text-gray-800 mb-4">{courseTitle}</h2>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm text-gray-600 mb-4">{progress}% COMPLETE</p>

      <div
        className={`p-2 rounded mb-1 cursor-pointer ${currentView === 'about' ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'}`}
        onClick={() => setCurrentView('about')}
      >
        <span className="text-sm text-gray-700">📘 About This Course</span>
      </div>

      {lessons.map((lesson) => {
        const completed = lessonStates.find((l) => l.id === lesson.id)?.completed;
        return (
          <div
            key={lesson.id}
            className={`p-2 rounded mb-1 cursor-pointer ${currentView === lesson.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'}`}
            onClick={() => setCurrentView(lesson.id)}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{lesson.title}</span>
              {completed && <span className="text-green-500 text-sm">✓</span>}
            </div>
          </div>
        );
      })}
    </aside>
  );
};

export default LessonBar;
