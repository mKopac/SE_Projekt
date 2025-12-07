import React from "react";
import { useTranslation } from "react-i18next";

type FaqAnswer = {
  paragraphs?: string[];
  bullets?: string[];
};

type FaqItem = {
  question: string;
  answer: FaqAnswer;
};

const PracticeFaq: React.FC = () => {
  const { t } = useTranslation("faq"); // namespace "faq"

  const rawItems = t("items", { returnObjects: true }) as unknown;
  const items: FaqItem[] = Array.isArray(rawItems) ? rawItems : [];

  return (
    <section className="faq-section">
      <h2>{t("title")}</h2>
      <p className="faq-intro">{t("intro")}</p>

      <div className="faq-list">
        {items.map((item, index) => (
          <article key={index} className="faq-block">
            <h3 className="faq-question-heading">{item.question}</h3>

            <div className="faq-answer">
              {item.answer.paragraphs &&
                item.answer.paragraphs.map((p, i) => <p key={i}>{p}</p>)}

              {item.answer.bullets && item.answer.bullets.length > 0 && (
                <ul>
                  {item.answer.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PracticeFaq;
