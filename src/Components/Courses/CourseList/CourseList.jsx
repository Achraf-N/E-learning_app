import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CoursList = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8080/modules/full');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();

        // Transform the API data to match your expected format
        const transformedData = data.map((course) => ({
          id: course.id,
          image: course.image,
          name: course.name || course.title, // Use name if available, otherwise title
          name_fr: course.name_fr,
          name_ar: null, // Add if your API provides Arabic names
          description: course.description,
          description_fr: course.description_fr,
          description_ar: null, // Add if your API provides Arabic descriptions
        }));

        setCourses(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  const getLocalizedCourse = (course) => {
    console.log(course);
    if (i18n.language === 'fr') {
      return {
        id: course.id,
        image: course.image,
        name: course.name_fr,
        description: course.description_fr,
      };
    }

    return {
      id: course.id,
      image: course.image,
      name: course.name,
      description: course.description,
    };
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div>
        <div className="container">
          <div>
            <div className="w-full xl:px-16 md:mt-20 mt-4 lg:w-10/12">
              <div className="mb-4 font-bold relative before:absolute before:hidden before:xl:block before:h-2 before:w-12 rtl:before:left-[56rem] ltr:before:-left-16 before:bg-third-color before:top-[1.2rem]">
                <h1 className="mb-2">
                  {t('all_courses')}: <br /> {t('find_all')}
                </h1>
              </div>
            </div>
          </div>
          <div>
            <Swiper
              breakpoints={{
                200: {
                  slidesPerView: 1,
                },
                550: {
                  slidesPerView: 2,
                },
                1023: {
                  slidesPerView: 3,
                },
              }}
              spaceBetween={30}
              grabCursor={true}
              className="mySwiper"
            >
              {courses.map((course) => {
                const localizedCourse = getLocalizedCourse(course);
                return (
                  <SwiperSlide
                    key={localizedCourse.id}
                    className="md:mt-16 mt-4 pb-16 rounded border shadow"
                  >
                    <div>
                      <LazyLoadImage
                        src={localizedCourse.image}
                        effect="blur"
                        alt={localizedCourse.name}
                        className="w-full aspect-[3/2] object-fill"
                      />
                      <div>
                        <h6 className="my-4 font-semibold">
                          {localizedCourse.name}
                        </h6>
                        <p className="text-base w-10/12 my-0 mx-auto">
                          {localizedCourse.description}
                        </p>
                      </div>
                      <div>
                        <Link to={`/course-details/${localizedCourse.id}`}>
                          <button type="submit">{t('learn_more')}</button>
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursList;
