import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye } from 'react-icons/ai';
import { Title } from '../../GeneralFunctions/title';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const showPassword = () => {
    setPasswordShown(!passwordShown);
  };

  Title('Taalam | Login');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, mot_de_passe: motDePasse }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        if (typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
          setError(errorData.detail.map((e) => e.msg).join(', '));
        } else {
          setError('Login failed');
        }
        return;
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      navigate('/');
    } catch (err) {
      setError('Network error');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const res = await fetch(
        'https://nginx-gateway.blackbush-661cc25b.spaincentral.azurecontainerapps.io/api/v1/oauth-login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) {
        const err = await res.json();

        if (typeof err.detail === 'string') {
          setError(err.detail);
        } else if (Array.isArray(err.detail)) {
          setError(err.detail.map((e) => e.msg).join(', '));
        } else {
          setError('Google login failed');
        }
        return;
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      navigate('/');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div name="Login">
      <div className="container">
        <div>
          <div className="flex flex-col lg:flex-row justify-between my-12 rounded-2xl loginShadow">
            <div className="bg-gray-color lg:w-1/2 p-12">
              <h1 className="md:text-4xl text-3xl">
                <span className="text-second-color font-semibold">
                  {t('header_title')}
                </span>{' '}
                <br /> {t('login_paragraph')}
              </h1>
              <div className="mt-4">
                <LazyLoadImage
                  src="https://ihozhkncmbnfrodpmrwo.supabase.co/storage/v1/object/public/images/logintwo.png"
                  className="lg:w-9/12 mx-auto sm:block hidden"
                  alt="Login"
                />
              </div>
            </div>
            <div className="lg:w-1/2 w-full rounded-3xl mt-8 lg:mt-0 px-12 lg:px-20 py-12 directionLeft">
              <div className="mb-6">
                <h1 className="mb-6 text-center">{t('welcome_back')}</h1>
                <h6>{t('login_nav')}</h6>
              </div>

              {/* Form login */}
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email">{t('email')}</label> <br />
                  <input
                    className="w-3/4 md:w-full"
                    type="email"
                    name="email"
                    placeholder={t('email')}
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="my-4">
                  <div>
                    <label htmlFor="password">{t('password')}</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      className="w-3/4 md:w-full"
                      type={passwordShown ? 'text' : 'password'}
                      name="password"
                      placeholder={t('password')}
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                    />
                    <AiOutlineEye
                      onClick={showPassword}
                      className="cursor-pointer text-xl"
                    />
                  </div>
                  <a href="#" className="text-xs">
                    {t('forgot_password')}
                  </a>
                </div>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <div>
                  <button className="w-full" type="submit">
                    {t('login_nav')}
                  </button>
                </div>
              </form>

              {/* Google Login */}
              <div className="my-6 text-center">
                <p className="mb-2">{t('OR')}</p>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => setError('Google login failed')}
                />
              </div>

              <div className="text-center mt-4">
                <p>
                  {t('not_registered')}{' '}
                  <Link className="font-semibold ml-1" to="/Sign-up">
                    {t('Sign-up_nav')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
