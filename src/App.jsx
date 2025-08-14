import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './GeneralFunctions/ScrollTop';
import { Navbar } from './INDEX';
const Home = lazy(() => import('./Components/Home/Home'));
const Teachers = lazy(() => import('./Components/Teachers/Home'));
const TeachersDetails = lazy(() =>
  import('./Components/Teachers/TeachersDetails/TeacherDetails')
);

const PrivateRoute = lazy(() =>
  import('./Components/PrivateRoute/PrivateRoute')
);
const AdminRoute = lazy(() => import('./Components/PrivateRoute/AdminRoute'));
const AboutUs = lazy(() => import('./Components/About-Us/Home'));
const SignUp = lazy(() => import('./Components/SignUp/SignUp'));
const Login = lazy(() => import('./Components/Login/Login'));
const Faq = lazy(() => import('./Components/Faq/Home'));
const Footer = lazy(() => import('./Components/Footer/Footer'));
const Blog = lazy(() => import('./Components/Blog/Home'));
const BlogDetails = lazy(() =>
  import('./Components/Blog/BlogDetails/BlogDetails')
);
const ContactUs = lazy(() => import('./Components/Contact-Us/Home'));
const Courses = lazy(() => import('./Components/Courses/Home'));
const CourseDetails = lazy(() =>
  import('./Components/Courses/CourseDetails/CourseDetails')
);
const ExamPage = lazy(() => import('./Components/Exams/ExamPage'));
const VerifyEmail = lazy(() => import('./Components/Verify/verify-email'));
const Error = lazy(() => import('./Components/404Error/Error'));
const Up = lazy(() => import('./Components/Ui/Up/Up'));
const AdminDashboard = lazy(() => import('./Components/Admin/AdminDashboard'));
const ManageCourses = lazy(() => import('./Components/Admin/ManageCourses'));
const VimeoUploader = lazy(() => import('./Components/Admin/VimeoUploader'));
const TestAuth = lazy(() => import('./Components/Admin/TestAuth'));
const QuickTest = lazy(() => import('./Components/Admin/QuickTest'));

const App = () => {
  return (
    <>
      <ScrollToTop>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/our-teachers" element={<Teachers />} />
          <Route
            path="/our-teachers/:teacherId"
            element={<TeachersDetails />}
          />
          {/*
          <Route path="/Blog" element={<Blog />} />
          <Route path="/blog-details/:blogId" element={<BlogDetails />} />
          */}
          <Route path="/our-courses" element={<Courses />} />
          <Route
            path="/course-details/:courseId"
            element={
              <PrivateRoute>
                <CourseDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/course-details/:courseId/lesson/:lessonId"
            element={
              <PrivateRoute>
                <CourseDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/course-details/:courseId/exam"
            element={
              <PrivateRoute>
                <ExamPage />
              </PrivateRoute>
            }
          />
          <Route path="/About-us" element={<AboutUs />} />
          <Route path="/Contact-Us" element={<ContactUs />} />
          <Route path="/Faq" element={<Faq />} />
          <Route path="/Sign-up" element={<SignUp />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/test-auth" element={<TestAuth />} />
          <Route path="/quick-test" element={<QuickTest />} />
          <Route path="/quick-test" element={<QuickTest />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute allowedRoles={['admin', 'teacher']}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/video-upload"
            element={
              <AdminRoute allowedRoles={['admin', 'teacher']}>
                <VimeoUploader />
              </AdminRoute>
            }
          />
          {/* Admin-only routes */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      User Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Manage students and teachers (Coming Soon)
                    </p>
                  </div>
                </div>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute allowedRoles={['admin', 'teacher']}>
                <ManageCourses />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <AdminRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      Create New Course
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Add a new course to the platform (Coming Soon)
                    </p>
                  </div>
                </div>
              </AdminRoute>
            }
          />
          {/* Teacher-specific routes */}
          <Route
            path="/teacher/students"
            element={
              <AdminRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      My Students
                    </h1>
                    <p className="text-gray-600 mt-2">
                      View your students' progress (Coming Soon)
                    </p>
                  </div>
                </div>
              </AdminRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <AdminRoute allowedRoles={['teacher']}>
                <div className="min-h-screen bg-gray-50 py-8">
                  <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      Assignments
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Create and grade assignments (Coming Soon)
                    </p>
                  </div>
                </div>
              </AdminRoute>
            }
          />
          <Route path="*" element={<Error />} />
        </Routes>
        <Up />
      </ScrollToTop>
    </>
  );
};

export default App;
