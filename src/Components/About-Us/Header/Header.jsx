import React from 'react';
import { Title } from '../../../GeneralFunctions/title';
import { useTranslation } from 'react-i18next';
import AboutUs2 from './../../../../src/Assets/AboutUs2.jpg';
const Header = () => {
  Title('Taalam | About-Us');
  const { t } = useTranslation();

  return (
    <div>
      <div
        className="bg-cover bg-fixed h-[70vh] relative"
        style={{ backgroundImage: `url(${AboutUs2})` }}
      >
        <div className="container">
          <div className="w-full lg:w-12/12 text-center text-main-color absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="mb-4 font-bold relative before:absolute before:hidden before:xl:block before:h-1 before:w-16 before:left-1/2 before:-translate-x-1/2  before:bg-second-color before:top-[115%]">
              <h1 className="mb-2">{t('about-us_nav')}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
