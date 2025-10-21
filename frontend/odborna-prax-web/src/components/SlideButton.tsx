import React from 'react';

type Props = {
  totalSlides: number;
  currentSlide: number;
  onNext: () => void;
  onPrev: () => void;
};

const SlideButton: React.FC<Props> = ({ totalSlides, currentSlide, onNext, onPrev }) => (
  <div className="slide-button">
    <p>
      Snímka {currentSlide + 1} z {totalSlides}
    </p>
    <div className="slide-nav">
      <button onClick={onPrev}>← Predchádzajúca</button>
      <button onClick={onNext}>Ďalšia →</button>
    </div>
  </div>
);

export default SlideButton;
