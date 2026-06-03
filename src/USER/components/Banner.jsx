import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';
import GlobalAxios from '../../../Global/GlobalAxios';

const DEFAULT_SLIDES = [
  { id: 1, image: 'slider1.jpg', title: 'Discover Rare Antiques', desc: 'Authentic collectibles curated from around the world', cta: 'Shop Now', href: '/category/1/antiques' },
  { id: 2, image: 'banner.jpeg', title: 'Navigation Instruments', desc: 'Precision compasses and telescopes for the explorer in you', cta: 'Explore', href: '/category/2/navigation' },
  { id: 3, image: 'banner2.jpg', title: 'New Arrivals Weekly', desc: 'Be the first to own the latest additions to our collection', cta: 'View New', href: '/feature-products' },
];

const imageBase = import.meta.env.VITE_IMAGE_BASE_URL;

const Banner = () => {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    GlobalAxios.get("/banners")
      .then((r) => { if (r.data.data?.length) setSlides(r.data.data); })
      .catch(() => {});
  }, []);

  const settings = {
    dots: true, infinite: true, speed: 800, slidesToShow: 1,
    slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000,
    fade: true, cssEase: 'ease-in-out', arrows: false,
  };

  const imgSrc = (image) => {
    if (!image) return '/banner.jpeg';
    if (image.startsWith('http')) return image;
    return `${imageBase}/${image}`;
  };

  return (
    <div className="w-full overflow-hidden">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id}>
            <div className="relative">
              <img
                src={imgSrc(slide.image)}
                alt={slide.title}
                className="w-full h-[220px] sm:h-[360px] md:h-[520px] object-cover object-center"
                style={{ aspectRatio: "1920/520" }}
                onError={(e) => { e.target.src = '/banner.jpeg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col items-start justify-center text-white px-8 md:px-20">
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">DanMart Global</span>
                <h2 className="text-3xl md:text-5xl font-black mb-3 max-w-xl leading-tight">{slide.title}</h2>
                <p className="text-slate-200 text-sm md:text-base mb-6 max-w-md">{slide.desc}</p>
                <Link to={slide.href || '/'}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all hover:shadow-lg active:scale-95 text-sm">
                  {slide.cta || 'Shop Now'} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
