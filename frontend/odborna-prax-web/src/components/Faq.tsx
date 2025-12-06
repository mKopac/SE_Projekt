import React, { useState } from "react";

interface FaqItem {
  id: number;
  question: string;
  answer: React.ReactNode;
}

const faqItems: FaqItem[] = [
  {
    id: 1,
    question: "Ako si mám nájsť firmu na odbornú prax?",
    answer: (
      <div>
        <p>
          Firma by mala mať náplň práce vhodnú pre rozvoj tvojich IT zručností.
          Prax by si si mal nájsť sám, občas ponúka prax aj univerzita.
        </p>
        <ul>
          <li>
            Prax musí byť <strong>overiteľná</strong> – garanti náhodne
            kontrolujú firmy a kontaktujú ich.
          </li>
          <li>
            Dbaj na to, aby <strong>kontaktné údaje v zmluve</strong> (meno,
            email, telefón) boli správne.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 2,
    question: "Môžem absolvovať prax v zahraničnej firme?",
    answer: (
      <div>
        <p>Áno, ale prax musí byť overiteľná:</p>
        <ul>
          <li>Firma musí mať funkčnú webovú stránku.</li>
          <li>
            Je pravdepodobné, že ju pracovisko bude telefonicky kontaktovať –
            kontaktná osoba musí vedieť po slovensky alebo po anglicky.
          </li>
          <li>
            Overovať sa môžu aj <strong>sociálne siete</strong> a podobné
            zdroje.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 3,
    question: "Prečo musím podpísať dohodu o odbornej praxi?",
    answer: (
      <div>
        <p>
          Dohoda o odbornej praxi preukazuje, že prax skutočne vykonávaš a chráni pracovisko pred vykonávaním čiernej práce.
        </p>
        <p>
          Bez platnej dohody (alebo alternatívnej zmluvy) nie je možné prax
          uznať.
        </p>
      </div>
    ),
  },
  {
    id: 4,
    question: "Ako mám navštevovať prax a kedy si zapísať predmet Odborná prax?",
    answer: (
      <div>
        <ul>
          <li>
            Prax navštevuješ <strong>v súlade s pokynmi pracoviska </strong>
            (pracovný čas, dochádzka, spôsob komunikácie atď.).
          </li>
          <li>
            Predmet <strong>Odborná prax</strong> si zapíš až v semestri, keď je
            predpoklad, že prax bude <strong>ukončená </strong> alebo máš dostatok hodín (min. 150).
          </li>
          <li>
            Prax <strong>nesmie začať skôr</strong>, ako nastúpiš na daný stupeň
            štúdia.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 5,
    question: "Ako prebieha obhajoba praxe?",
    answer: (
      <div>
        <p>Obhajoba praxe prebieha formou posterovej prezentácie:</p>
        <ul>
          <li>
            Na konci semestra vytvoríš <strong>poster</strong>, na ktorom
            predstavíš svoju prax a výsledky.
          </li>
          <li>
            Prihlásiš sa na termín obhajoby cez{" "}
            <strong>aplikovanainformatika.sk</strong>.
          </li>
          <li>
            Na termíne máš pripravený a rozložený poster, vysvetlíš, čo si robil
            a čo sa podarilo.
          </li>
          <li>Po diskusii sa môžeš zbaliť – obhajoba je ukončená.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 6,
    question:
      "Aké sú alternatívy k dohode o odbornej praxi (napr. pri brigáde alebo TPP)?",
    answer: (
      <div>
        <p>
          Namiesto dohody o odbornej praxi môžeš použiť aj iné pracovné vzťahy,
          ak práca spadá do IT oblasti:
        </p>
        <ul>
          <li>
            dohoda o brigádnickej činnosti minimálne na požadovaný počet hodín,
          </li>
          <li>
            dohoda o vykonaní práce alebo dohoda o pracovnej činnosti na daný
            počet hodín,
          </li>
          <li>pracovná zmluva.</li>
        </ul>
        <p>
          Vtedy prikladáš <strong>dohodu alebo zmluvu</strong> medzi tebou a
          firmou (môžeš zneviditeľniť mzdu) a <strong>nie je</strong> potrebné
          podpisovať dohodu s univerzitou.
        </p>
      </div>
    ),
  },
  {
    id: 7,
    question:
      "Musím absolvovať obhajobu praxe aj pri alternatívnej forme (brigáda, TPP a pod.)?",
    answer: (
      <div>
        <p>
          Áno. Alternatívne riešenia praxe <strong>nezbavujú</strong> študenta
          povinnosti obhajoby. Stále musíš pripraviť poster a prax obhájiť.
        </p>
      </div>
    ),
  },
  {
    id: 8,
    question: "Aké dôkazy o absolvovaní praxe musím mať?",
    answer: (
      <div>
        <p>Dôkazy sú dôležité pri obhajobe aj pri prípadnom overovaní praxe:</p>
        <ul>
          <li>
            <strong>Výkaz o vykonanej odbornej praxi</strong> + hodnotenie
            študenta od firmy.
          </li>
          <li>
            <strong>Fotografie</strong> aktivít (hardvér, práca s ľuďmi, školenia)
            a <strong>screenshoty</strong> vytvorených aplikácií alebo softvéru.
          </li>
          <li>
            <strong>Poster</strong> – vizuálna prezentácia praxe (výstupy,
            projekty, riešenia).
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 9,
    question:
      "Aké materiály si mám priniesť na posterovú prezentáciu (obhajobu)?",
    answer: (
      <div>
        <ul>
          <li>
            Výkaz o vykonanej odbornej praxi + hodnotenie študenta (potvrdené
            firmou).
          </li>
          <li>
            Ak ide o platenú aktivitu: <strong>kópiu zmluvy</strong> (mzda môže
            byť zneviditeľnená).
          </li>
          <li>
            Ak ide o aktivity v rámci vlastnej firmy, postupuje sa{" "}
            <strong>individuálne</strong> po dohode s hodnotiacim (napr.
            doloženie faktúr dodávateľov). Nie je možné robiť pre vlastnú firmu
            veci určené len na interné použitie.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 10,
    question: "Ako má vyzerať poster k odbornej praxi?",
    answer: (
      <div>
        <ul>
          <li>
            Plagát formátu <strong>A2</strong> vytvorený napr. v Canve podobne
            ako postery záverečných prác, prípadne vhodná kombinácia A4 (musí
            byť dobre čitateľný aj z diaľky).
          </li>
          <li>
            Musí obsahovať: <strong>meno študenta</strong>,{" "}
            <strong>názov firmy</strong> a <strong>činnosť</strong>, ktorú si
            robil najčastejšie.
          </li>
          <li>
            Kombinácia fotografií aktivít, printscreenov aplikácií, ukážok
            hardvérového riešenia, mobilných aplikácií a podobne – všetko
            vizuálne podporené textom na posteri.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 11,
    question: "Ako prebieha samotná obhajoba na termíne?",
    answer: (
      <div>
        <ul>
          <li>
            <strong>Prihlásiš sa</strong> na termín cez aplikovanainformatika.sk.
          </li>
          <li>
            Pripravíš si, čo chceš povedať – sústreď sa na to, <strong>čo sa podarilo</strong>, nie na to, čo sa nepodarilo.
          </li>
          <li>
            V čase termínu máš poster už <strong>rozložený</strong> a si
            pripravený prezentovať.
          </li>
          <li>
            Po prezentácii a diskusii sa môžeš zbaliť – obhajoba je ukončená.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 12,
    question: "Čo sa deje po obhajobe praxe (post-processing)?",
    answer: (
      <div>
        <ul>
          <li>Vybrané praxe budú ešte dodatočne overované.</li>
          <li>
            Po skončení overovacieho procesu prebehne{" "}
            <strong>zápis hodnotenia do AIS</strong>.
          </li>
        </ul>
      </div>
    ),
  },
];

const PracticeFaq: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="faq-section">
      <h2>FAQ k odbornej praxi (AI)</h2>
      <p className="faq-intro">
        Najčastejšie otázky k procesu praxe, zmluvám, obhajobe a posterovej
        prezentácii.
      </p>

      <div className="faq-list">
        {faqItems.map((item) => (
          <div key={item.id} className="faq-item">
            <button
              type="button"
              className="faq-question"
              onClick={() => toggleItem(item.id)}
            >
              <span>{item.question}</span>
              <span className="faq-toggle">{openId === item.id ? "−" : "+"}</span>
            </button>
            {openId === item.id && (
              <div className="faq-answer">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PracticeFaq;
