import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AiOutlineEye } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { Title } from '../../GeneralFunctions/title';
import { useTranslation } from 'react-i18next';

const SignUp = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showPassword = () => setPasswordShown(!passwordShown);

  Title('Taalam | Sign Up');
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert(t('passwords_do_not_match') || 'Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_utilisateur: nomUtilisateur,
          email,
          mot_de_passe: password,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        const data = await response.json();
        alert(data.detail || 'Erreur lors de l’inscription');
      }
    } catch (error) {
      alert('Erreur réseau ou serveur');
    }
  };

  if (emailSent) {
    return (
      <div className="container p-12">
        <h2>{t('verification_email_sent') || 'Verification Email Sent!'}</h2>
        <p>
          {t('check_your_email_message', { email }) ||
            `We sent a verification email to ${email}.`}
        </p>
        <p>
          {t('please_verify_before_login') ||
            'Please verify your email before logging in.'}
        </p>
        <Link to="/Login">{t('go_to_login') || 'Go to Login'}</Link>
      </div>
    );
  }

  return (
    <div name="Sign-up">
      <div className="container">
        <div className="flex flex-col items-center lg:flex-row justify-between my-12 p-12 rounded-2xl loginShadow">
          <LazyLoadImage
            src="https://ihozhkncmbnfrodpmrwo.supabase.co/storage/v1/object/public/images/Studying.jpeg"
            className="lg:w-1/2 sm:block hidden"
            alt="Sign Up"
          />
          <div className="lg:w-1/2 w-full mt-8 lg:mt-0 rtl:lg:pr-20 ltr:lg:pl-20 directionLeft">
            <h1>
              {t('welcome_to')}{' '}
              <span className="text-second-color font-semibold">
                {t('header_title')}
              </span>
            </h1>
            <div className="mt-8">
              <div className="mb-8">
                <h6 className="font-semibold">{t('create_account')}</h6>
                <p className="text-sm">{t('signup_paragraph')}</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="nom_utilisateur">
                    {t('username') || 'Username'}
                  </label>
                  <br />
                  <input
                    className="w-3/4 md:w-full"
                    type="text"
                    name="nom_utilisateur"
                    placeholder={t('username') || 'Username'}
                    value={nomUtilisateur}
                    onChange={(e) => setNomUtilisateur(e.target.value)}
                    required
                  />
                </div>
                <div className="my-4">
                  <label htmlFor="email">{t('email')}</label>
                  <br />
                  <input
                    className="w-3/4 md:w-full"
                    type="email"
                    name="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="my-4">
                  <label htmlFor="password">{t('password')}</label>
                  <div className="flex items-center">
                    <input
                      className="w-3/4 md:w-full"
                      type={passwordShown ? 'text' : 'password'}
                      name="password"
                      placeholder={t('password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <AiOutlineEye
                      onClick={showPassword}
                      className="cursor-pointer text-xl ml-2"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm_password">
                    {t('confirm_password')}
                  </label>
                  <br />
                  <input
                    className="w-3/4 md:w-full"
                    type="password"
                    name="confirm_password"
                    placeholder={t('confirm_password')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <button className="w-full mt-6" type="submit">
                    {t('Sign-up_nav')}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4">
                <p>
                  {t('have_account')}{' '}
                  <Link className="font-semibold ml-2" to="/Login">
                    {t('login_nav')}
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

export default SignUp;
