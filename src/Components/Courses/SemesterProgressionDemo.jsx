import React from 'react';
import CoursList from '../CourseList/CourseList';

/**
 * Demo component to test the semester progression system
 * This component shows how the CourseList now handles semester-based progression
 */
const SemesterProgressionDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">
            🎓 Semester Progression System Demo
          </h1>
          <p className="text-blue-100 text-lg">
            Experience how students progress through semesters based on course
            completion
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                🔒
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-800">
                Progressive Unlocking
              </h3>
            </div>
            <p className="text-gray-600">
              Students can only access S2 courses after completing all S1
              courses, and so on through S3 and S4.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                📊
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-800">
                Progress Tracking
              </h3>
            </div>
            <p className="text-gray-600">
              Visual progress bars show completion status for each semester and
              individual courses.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                🎯
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-800">
                Smart Prerequisites
              </h3>
            </div>
            <p className="text-gray-600">
              Each course can have specific prerequisites that must be completed
              before enrollment.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            How Semester Progression Works:
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                For Students:
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Start with S1 courses (always accessible)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Complete ALL S1 courses to unlock S2
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Visual progress indicators show your advancement
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Locked courses show clear unlock requirements
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">For Admins:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Can manually unlock modules if needed
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Track student progress across all semesters
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  View detailed completion statistics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Override semester restrictions when necessary
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-yellow-800 mb-3">
            🧪 Test Instructions
          </h3>
          <div className="text-yellow-700">
            <p className="mb-2">
              <strong>To test the semester progression system:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Log in as a student account</li>
              <li>Notice that only S1 courses are initially accessible</li>
              <li>Complete S1 courses to unlock S2</li>
              <li>
                Try clicking on locked courses to see the unlock requirements
              </li>
              <li>Check the progress indicators at the top</li>
            </ol>
          </div>
        </div>
      </div>

      {/* The actual CoursList component */}
      <CoursList />

      {/* Footer */}
      <div className="bg-gray-800 text-white text-center py-6 mt-12">
        <p className="text-gray-300">
          🎓 Semester Progression System - Ensuring structured learning paths
        </p>
      </div>
    </div>
  );
};

export default SemesterProgressionDemo;
