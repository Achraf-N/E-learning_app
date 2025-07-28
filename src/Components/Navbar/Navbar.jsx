import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { TranslateIcon } from '../../INDEX';
import LogoImg from './../../Assets/MenDarkLogo.jpg';

const Navbar = () => {
  const [nav, setNav] = useState(true);
  const navigate = useNavigate();

  const navHandle = () => {
    setNav(!nav);
  };

  const { t } = useTranslation();

  // ✅ Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('access_token');

  // ✅ Get user role for dashboard access
  const token = localStorage.getItem('access_token');
  let userRole = null;
  let userRoles = [];
  try {
    if (token) {
      const user = jwtDecode(token);
      // Handle both 'role' (string) and 'roles' (array) formats
      userRoles = user.roles || (user.role ? [user.role] : []);
      userRole = userRoles[0]; // Use first role for display
    }
  } catch (error) {
    // Token is invalid, remove it
    localStorage.removeItem('access_token');
  }

  const canAccessDashboard =
    userRoles.includes('admin') || userRoles.includes('teacher');

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/Login');
  };

  return (
    <>
      <div
        className="z-10 w-full relative py-1 shadow-md activeClass"
        name="nav"
      >
        <div className="container">
          <div className="flex justify-between py-1 items-center">
            <div>
              <img className="w-20 lg:w-24" src={LogoImg} alt="Logo" />
            </div>
            <div className="hidden md:flex">
              <Link className="nav-link" to="/">
                {t('home_nav')}
              </Link>
              <Link className="nav-link" to="/our-courses">
                {t('courses_nav')}
              </Link>
              <Link className="nav-link" to="/our-teachers">
                {t('teachers_nav')}
              </Link>
              {/*
              <Link className="nav-link" to="/Blog">
                {t('blog_nav')}
              </Link>
              */}
              <Link className="nav-link" to="/About-us">
                {t('about-us_nav')}
              </Link>
              <Link className="nav-link" to="/Contact-Us">
                {t('contact-us_nav')}
              </Link>
              {/* Dashboard link for admin and teacher */}
              {canAccessDashboard && (
                <Link className="nav-link" to="/admin/dashboard">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Dashboard
                  </div>
                </Link>
              )}
            </div>

            <div className="md:flex hidden">
              {/* Role indicator for admin/teacher */}
              {canAccessDashboard && (
                <div className="flex items-center mr-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userRole === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {userRole === 'admin' ? 'Admin' : 'Teacher'}
                  </span>
                </div>
              )}
              <div>
                {isLoggedIn ? (
                  <div
                    onClick={handleLogout}
                    className="border-2 px-[0.5rem] py-2 lg:px-4 rounded duration-300 hover:border-second-color-opacity cursor-pointer"
                    type="button"
                  >
                    {t('logout') || 'Logout'}
                  </div>
                ) : (
                  <Link to="/Login">
                    <div
                      className="border-2 px-[0.5rem] py-2 lg:px-4 rounded duration-300 hover:border-second-color-opacity"
                      type="button"
                    >
                      {t('login_nav')}
                    </div>
                  </Link>
                )}
              </div>
              <div>
                {!isLoggedIn && (
                  <Link to="/Sign-up">
                    <div className="bg-second-color-opacity border-2 border-second-color-opacity px-[0.5rem] py-2 lg:px-4 duration-300 text-main-color ltr:ml-4 rtl:mr-4 rounded hover:border-second-color hover:bg-second-color">
                      {t('Sign-up_nav')}
                    </div>
                  </Link>
                )}
              </div>

              <div>
                <TranslateIcon />
              </div>
            </div>

            <div className="md:hidden">
              <div className="cursor-pointer">
                {nav ? (
                  <AiOutlineMenu className="text-2xl" onClick={navHandle} />
                ) : (
                  <AiOutlineClose className="text-2xl" onClick={navHandle} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            nav
              ? 'relative duration-500 opacity-0 w-full h-[0vh]'
              : 'relative duration-500 opacity-100 w-full bg-main-color h-[150vh] p-4'
          }
        >
          <div>
            <div>
              <h1 className="md:hidden text-2xl mb-4">Taalam</h1>
            </div>
            <div className="flex flex-col">
              <Link className="nav-link-sm" onClick={navHandle} to="/">
                {t('home_nav')}
              </Link>
              <Link
                className="nav-link-sm"
                onClick={navHandle}
                to="/our-courses"
              >
                {t('courses_nav')}
              </Link>
              <Link
                className="nav-link-sm"
                onClick={navHandle}
                to="/our-teachers"
              >
                {t('teachers_nav')}
              </Link>
              <Link className="nav-link-sm" onClick={navHandle} to="/Blog">
                {t('blog_nav')}
              </Link>
              <Link className="nav-link-sm" onClick={navHandle} to="/About-us">
                {t('about-us_nav')}
              </Link>
              <Link
                className="nav-link-sm"
                onClick={navHandle}
                to="/Contact-Us"
              >
                {t('contact-us_nav')}
              </Link>
              {/* Dashboard link for mobile - admin and teacher */}
              {canAccessDashboard && (
                <Link
                  className="nav-link-sm flex items-center"
                  onClick={navHandle}
                  to="/admin/dashboard"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Dashboard
                </Link>
              )}
            </div>
            <div className="md:flex block">
              <div>
                {isLoggedIn ? (
                  <div
                    onClick={() => {
                      handleLogout();
                      navHandle();
                    }}
                    className="border-2 px-[0.5rem] py-2 lg:px-4 rounded text-center duration-300 hover:border-second-color-opacity cursor-pointer"
                    type="button"
                  >
                    {t('logout') || 'Logout'}
                  </div>
                ) : (
                  <Link to="/Login">
                    <div
                      onClick={navHandle}
                      className="border-2 px-[0.5rem] py-2 lg:px-4 rounded text-center duration-300 hover:border-second-color-opacity"
                      type="button"
                    >
                      {t('login_nav')}
                    </div>
                  </Link>
                )}
              </div>

              <div>
                <Link to="/Sign-up">
                  <div
                    onClick={navHandle}
                    className="bg-second-color-opacity border-2 border-second-color-opacity px-[0.5rem] py-2 duration-300 text-main-color text-center rounded hover:border-second-color hover:bg-second-color"
                    type="submit"
                  >
                    {t('Sign-up_nav')}
                  </div>
                </Link>
              </div>

              <div>
                <TranslateIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
