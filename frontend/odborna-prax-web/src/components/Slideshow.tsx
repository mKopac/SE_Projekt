import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './../css/Slideshow.css';
import { manualStrategy, autoStrategy } from './slideStrategies';
import type { SlideStrategy } from './slideStrategies';

type Slide = {
  title: string;
  text: string;
  buttons?: { label: string; link: string }[];
};

const slides: Slide[] = [
  {
    title: 'Vitajte v systéme na evidenciu praxe FPVaI UKF Nitra',
    text: 'Moderný nástroj pre študentov a firmy, ktorý umožňuje evidenciu odbornej praxe na jednom mieste.',
  },
  {
    title: 'Pre študentov',
    text: 'Sledujte stav praxe, komunikujte s mentormi, získajte spätnú väzbu – všetko na jednom mieste.',
  },
  {
    title: 'Pre firmy',
    text: 'Schvaľujte praxe, zadávajte úlohy, hodnotte študentov bez papierovačiek.',
  },
  {
    title: 'Ako systém funguje?',
    text: 'Zaregistrujte sa, vyberte si prax, získajte potvrdenie a hodnotenie od mentora.',
  },
  {
    title: 'Filtrovanie praxe',
    text: 'Vyfiltrujte si prax podľa odboru, lokality, typu práce a dostupnosti.',
  },
  {
    title: 'Začnite ešte dnes',
    text: 'Zaregistrujte sa alebo sa prihláste a začnite evidovať svoju prax.',
    buttons: [
      { label: 'Zaregistrovať sa', link: '/register' },
      { label: 'Prihlásiť sa', link: '/login' },
    ],
  },
];

const AUTO_INTERVAL = 20000;

const Slideshow: React.FC = () => {
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
  }, []);

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
            <button onClick={prevSlide}>← Predchádzajúca</button>
            <button onClick={nextSlide}>Ďalšia →</button>
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
