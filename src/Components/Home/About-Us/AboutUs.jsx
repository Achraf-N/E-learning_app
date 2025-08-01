import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Teacher from './../../../Assets/teacher.png';
import Digital from './../../../Assets/digitalization.png';
import LowCoast from './../../../Assets/low-cost.png';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="container">
        <div className="w-full xl:px-16 mt-0 md:mt-20 lg:w-10/12">
          <div className="mb-4 font-bold relative before:absolute before:hidden before:xl:block before:h-2 before:w-12 rtl:before:left-[56rem] ltr:before:-left-16 before:bg-third-color before:top-[1.2rem]">
            <h1 className="mb-2">
              {t('home_about-us_heading')} <br />{' '}
              {t('home_about-us_sub_heading')}
            </h1>
          </div>
          <p>{t('home_about-us_paragraph')}</p>
          <Link to="/About-us">
            <button type="submit">{t('learn_more')}</button>
          </Link>
        </div>
      </div>
      <div className="bg-gray-color py-16 w-full mt-8">
        <div className="container">
          <div className="flex flex-col lg:flex-row">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              variants={{
                hidden: { opacity: 0, y: -150 },
                visible: { opacity: 1, y: 0 },
              }}
              className="textCenter bg-main-color p-12 rounded shadow relative w-full"
            >
              <div>
                <img src={Teacher} className="w-[60px]" alt="teacher" />
                <div>
                  <h6 className="my-4">
                    {t('about-us_best-teachers_best_teachers')}
                  </h6>
                  <p>{t('about-us_best-teachers_paragraph_best_teachers')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
              variants={{
                hidden: { opacity: 0, y: -150 },
                visible: { opacity: 1, y: 0 },
              }}
              className="textCenter bg-main-color p-12 rounded shadow relative w-full my-8 lg:my-0 lg:mx-8"
            >
              {' '}
              <div>
                <img src={Digital} className="w-[60px]" alt="digital" />
                <div>
                  <h6 className="my-4">
                    {t('about-us_best-teachers_digital_learning')}
                  </h6>
                  <p>
                    {t('about-us_best-teachers_paragraph_digital_learning')}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.1 }}
              variants={{
                hidden: { opacity: 0, y: -150 },
                visible: { opacity: 1, y: 0 },
              }}
              className="textCenter bg-main-color p-12 rounded shadow relative w-full"
            >
              {' '}
              <div>
                <img src={LowCoast} className="w-[60px]" alt="low coast" />
                <div>
                  <h6 className="my-4">
                    {t('about-us_best-teachers_low_coast')}
                  </h6>
                  {t('about-us_best-teachers_paragraph_low_coast')}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
