import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';

const slides = [
  { image: 'slider1.jpg', title: 'Discover Rare Antiques', desc: 'Authentic collectibles curated from around the world', cta: 'Shop Now', href: '/category/1/antiques' },
  { image: 'banner.jpeg',  title: 'Navigation Instruments', desc: 'Precision compasses and telescopes for the explorer in you', cta: 'Explore', href: '/category/2/navigation' },
  { image: 'banner2.jpg',  title: 'New Arrivals Weekly', desc: 'Be the first to own the latest additions to our collection', cta: 'View New', href: '/feature-products' },
];

const Banner = () => {
  const settings = { dots: true, infinite: true, speed: 600, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000, fade: true, cssEase: 'ease-in-out', arrows: false };

  return (
    <div className="w-full overflow-hidden">
      <Slider {...settings}>
        {slides.map((slide, i) => (
          <div key={i} className="relative">
            <img src={slide.image} alt={slide.title} className="w-full h-[300px] md:h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col items-start justify-center text-white px-8 md:px-20">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">DanMart Global</span>
              <h2 className="text-3xl md:text-5xl font-black mb-3 max-w-xl leading-tight">{slide.title}</h2>
              <p className="text-slate-200 text-sm md:text-base mb-6 max-w-md">{slide.desc}</p>
              <Link to={slide.href}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all hover:shadow-lg active:scale-95 text-sm">
                {slide.cta} →
              </Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
