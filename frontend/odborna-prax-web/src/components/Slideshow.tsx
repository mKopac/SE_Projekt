import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './../css/Slideshow.css';
import { manualStrategy, autoStrategy } from './slideStrategies';
import type { SlideStrategy } from './slideStrategies';
import { useTranslation } from "react-i18next";

type Slide = {
  title: string;
  text: string;
  buttons?: { label: string; link: string }[];
};

const AUTO_INTERVAL = 20000;

const Slideshow: React.FC = () => {
  const { t } = useTranslation("landing");

  const slides = t("slideshow.slides", { returnObjects: true }) as Slide[];

  const [currentSlide, setCurrentSlide] = useState(0);
  const strategy: SlideStrategy = autoStrategy(AUTO_INTERVAL);

  const nextSlide = () => {
    setCurrentSlide((prev) => strategy.next(prev, slides.length));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => strategy.prev(prev, slides.length));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => strategy.next(prev, slides.length));
    }, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [strategy, slides.length]);

  const slide = slides[currentSlide];

  return (
    <section className="slideshow">
      <div className="slide-box">
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>

        {slide.buttons && (
          <div className="slide-buttons">
            {slide.buttons.map((btn, index) => (
              <Link
                key={index}
                to={btn.link}
                className={`slide-btn ${index === 1 ? 'slide-btn-secondary' : ''}`}
              >
                {btn.label}
              </Link>
            ))}
          </div>
        )}

        <div className="slide-footer">
          <div className="slide-nav">
            <button onClick={prevSlide}>{t("slideshow.nav.prev")}</button>
            <button onClick={nextSlide}>{t("slideshow.nav.next")}</button>
          </div>

          <div className="slide-info">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Slideshow;
