import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './../css/Slideshow.css';

type Slide = {
  title: string;
  text: string;
  buttons?: { label: string; link: string }[];
};

const slides: Slide[] = [
  {
    title: '🏁 Vitajte v systéme na evidenciu praxe',
    text: 'Moderný nástroj pre študentov, mentorov a školy. Jednoduchý. Prehľadný. Efektívny.',
  },
  {
    title: '⚙️ Ako systém funguje?',
    text: 'Zaregistrujte sa, vyberte si prax, získajte potvrdenie a hodnotenie od mentora.',
  },
  {
    title: '🎓 Pre študentov',
    text: 'Sledujte stav praxe, komunikujte s mentormi, získajte spätnú väzbu – všetko na jednom mieste.',
  },
  {
    title: '🏢 Pre firmy a mentorov',
    text: 'Schvaľujte praxe, zadávajte úlohy, hodnotte študentov bez papierovačiek.',
  },
  {
    title: '🔍 Filtrovanie praxe',
    text: 'Vyfiltrujte si prax podľa odboru, lokality, typu práce a dostupnosti.',
  },
  {
    title: '🚀 Začnite ešte dnes',
    text: 'Zaregistrujte sa alebo sa prihláste a začnite evidovať svoju prax.',
    buttons: [
      { label: 'Zaregistrovať sa', link: '/register' },
      { label: 'Prihlásiť sa', link: '/login' },
    ],
  },
];

const Slideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section className="slideshow">
      <div className="slide-box">
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>

        {slide.buttons && (
          <div className="slide-buttons">
            {slide.buttons.map((btn, index) => (
              <Link key={index} to={btn.link} className="slide-btn">
                {btn.label}
              </Link>
            ))}
          </div>
        )}

        <div className="slide-nav">
          <button onClick={prevSlide}>← Predchádzajúca</button>
          <button onClick={nextSlide}>Ďalšia →</button>
        </div>
      </div>

      <div className="slide-info">
        Snímka {currentSlide + 1} z {slides.length}
      </div>
    </section>
  );
};

export default Slideshow;
