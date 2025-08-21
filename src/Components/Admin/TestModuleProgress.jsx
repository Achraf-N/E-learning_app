import React, { useState } from 'react';
import UserDetailsModal from './UserDetailsModal';

const TestModuleProgress = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const mockUsers = [
    {
      id: 1,
      first_name: 'John',
      nom_utilisateur: 'john_doe',
      email: 'john@example.com',
      roles: ['student'],
      is_verified: true,
      statut_compte: 'ACTIF',
      semester: 'S1',
    },
    {
      id: 2,
      first_name: 'Alice',
      nom_utilisateur: 'alice_smith',
      email: 'alice@example.com',
      roles: ['student'],
      is_verified: true,
      statut_compte: 'ACTIF',
      semester: 'S2',
    },
  ];

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Test Module Progress System
        </h1>
        <p className="text-gray-600 mb-6">
          Click on a user card to test the new module and lesson progress
          tracking system. The modal now displays both module-level and
          lesson-level progress with unlock functionality.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleViewUser(user)}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.first_name?.[0] || user.nom_utilisateur?.[0] || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.first_name || user.nom_utilisateur}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {user.roles?.[0] || 'student'}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {user.semester || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Progress Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Module Progress Features:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Module-level progress tracking with unlock status</li>
            <li>• Exam-based module unlocking system</li>
            <li>• Visual progress bars and completion indicators</li>
            <li>• Admin controls to manually unlock modules</li>
            <li>• Lesson-level progress within each module</li>
            <li>• Last accessed timestamps for lessons</li>
          </ul>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onUserUpdate={(updatedUser) => {
            console.log('User updated:', updatedUser);
            // Here you would typically update the user in your state
          }}
          onUserDelete={(userId) => {
            console.log('User deleted:', userId);
            // Here you would typically remove the user from your state
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TestModuleProgress;
