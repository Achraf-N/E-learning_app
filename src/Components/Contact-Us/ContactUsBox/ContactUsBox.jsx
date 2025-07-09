import React from 'react';
import { useTranslation } from 'react-i18next';

const ContactUsBox = () => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <div className="container">
          <div>
            <div className="w-full xl:px-16 mt-20 lg:w-8/12">
              <div className="mb-4 font-bold relative before:absolute before:hidden before:xl:block before:h-2 before:w-12 rtl:before:left-[44rem] ltr:before:-left-16 before:bg-third-color before:top-[1.2rem]">
                <h1 className="mb-2">{t('eager')}</h1>
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-color mt-8 mb-20 shadow-xl directionLeft">
            <div className="flex flex-col p-12 lg:flex-row">
              <div className="w-full lg:w-5/12">
                <div>
                  <h1 className="text-4xl mb-8"> {t('send_msg')}</h1>
                </div>
                <form>
                  <div>
                    <label htmlFor="email">{t('email')}</label> <br />
                    <input type="email" name="email" placeholder={t('email')} />
                  </div>
                  <div className="my-4">
                    <label htmlFor="password">{t('password')}</label>{' '}
                    <div className="flex items-center">
                      <input
                        type="password"
                        name="password"
                        placeholder={t('password')}
                      />{' '}
                      <br />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password">{t('message')}</label>
                    <br />
                    <textarea
                      name="message"
                      id="message"
                      placeholder={t('message')}
                      className="w-full h-44"
                    ></textarea>
                  </div>
                  <button type="submit">{t('submit')}</button>
                </form>
              </div>
              <div className="lg:w-1/2 w-full mt-8 lg:mt-0 lg:pl-20 border-l-2">
                <div>
                  <h1 className="text-4xl lg:text-center mb-8">
                    {t('where_find_us')}
                  </h1>
                </div>
                <div>
                  <iframe
                    className="w-full h-[26rem]"
                    src=""
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsBox;
