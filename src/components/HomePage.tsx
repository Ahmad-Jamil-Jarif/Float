import React, { useEffect } from 'react';
import { ArrowUpRight, ChevronRight, Compass, Mail, MapPin, MoveUpRight, Phone, Sparkles } from 'lucide-react';

interface HomePageProps {
  onSwitchView: (view: 'canvas' | 'list' | 'staff' | 'home') => void;
}

const EchoWord = ({ children }: { children: string }) => (
  <span className="echo-word" aria-label={children}>
    {[4, 3, 2, 1].map((layer) => (
      <span key={layer} className={`echo-layer echo-layer-${layer}`} aria-hidden="true">
        {children}
      </span>
    ))}
    <span className="echo-front">{children}</span>
  </span>
);

const ImageCard = ({
  className,
  image,
  eyebrow,
  title,
  detail,
  shape = 'square',
}: {
  className?: string;
  image: string;
  eyebrow: string;
  title: string;
  detail: string;
  shape?: 'square' | 'pill' | 'circle';
}) => (
  <article className={`showcase-card ${shape} ${className ?? ''}`}>
    <img src={image} alt="" />
    <div className="showcase-shade" />
    <div className="showcase-copy">
      <span>{eyebrow}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
    <span className="card-arrow"><ArrowUpRight size={18} /></span>
  </article>
);

export const HomePage: React.FC<HomePageProps> = ({ onSwitchView }) => {
  useEffect(() => {
    const updateShoreOpacity = () => {
      const fadeDistance = Math.max(window.innerHeight * 0.9, 620);
      const progress = Math.min(window.scrollY / fadeDistance, 1);
      document.documentElement.style.setProperty('--shore-opacity', String(0.86 - progress * 0.86));
    };

    updateShoreOpacity();
    window.addEventListener('scroll', updateShoreOpacity, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateShoreOpacity);
      document.documentElement.style.removeProperty('--shore-opacity');
    };
  }, []);

  const goTo = (view: 'canvas' | 'list') => (event: React.MouseEvent) => {
    event.preventDefault();
    onSwitchView(view);
  };

  return (
    <div className="home-page">
      <div className="shore-backdrop" aria-hidden="true">
        <video
          className="shore-video"
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1507529210025-5a7e8b4c5c8b?auto=format&fit=crop&w=2400&q=85"
        >
          <source src="/Images/Sea%20Shore.mp4" type="video/mp4" />
        </video>
        <div className="shore-fallback" />
        <div className="shore-vignette" />
      </div>
      <main>
        <section className="hero-section">
          <div className="hero-meta">
            <span>08° 39' S / 115° 13' E</span>
            <span className="hero-status"><i /> Open for arrivals · 2026</span>
          </div>
          <div className="hero-heading">
            <p className="section-kicker">A quiet architecture for living</p>
            <h1><EchoWord>FLOAT</EchoWord><em>RESORT</em></h1>
            <p className="hero-intro">
              An edited collection of private villas, slow rituals, and ocean air.
              Find your own distance from the ordinary.
            </p>
            <div className="hero-actions">
              <a href="#explore" className="button button-dark" onClick={goTo('canvas')}>
                Explore the grounds <MoveUpRight size={16} />
              </a>
              <a href="#villas" className="text-link" onClick={goTo('list')}>
                View residences <ChevronRight size={16} />
              </a>
            </div>
          </div>
          <div className="hero-scroll"><span /> Scroll to wander</div>
          <div className="hero-mark" aria-hidden="true">F<span>R</span></div>
        </section>

        <section className="manifesto-section" id="about">
          <div className="vertical-rule" />
          <p className="section-kicker">01 / The philosophy</p>
          <blockquote>
            We make room for the <em>unhurried</em> — spaces that hold the light,
            the tide, and whatever you came here to remember.
          </blockquote>
          <div className="manifesto-grid">
            <div><span className="grid-number">01</span><h3>Less, but better</h3><p>Thirty-two considered villas, each with a view, a breeze, and nothing to distract from it.</p></div>
            <div><span className="grid-number">02</span><h3>In the elements</h3><p>Stone, timber, water, and shade. Our materials are borrowed from the island, never imposed on it.</p></div>
            <div><span className="grid-number">03</span><h3>Always local</h3><p>From the morning market to the hands that shape your dinner, every detail begins close to home.</p></div>
          </div>
        </section>

        <section className="collection-section" id="villas">
          <div className="section-heading">
            <div><p className="section-kicker">02 / The collection</p><h2>Stay close<br /><em>to the extraordinary.</em></h2></div>
            <a href="#all-villas" className="text-link" onClick={goTo('list')}>Browse all villas <ArrowUpRight size={16} /></a>
          </div>
          <div className="showcase-grid">
            <ImageCard className="feature-card" image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85" eyebrow="01 / The horizon" title="Ocean House" detail="4 bedrooms · private infinity pool" />
            <ImageCard className="pill-card" shape="pill" image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=85" eyebrow="02 / The garden" title="Canopy Suite" detail="A room above the palms" />
            <ImageCard className="circle-card" shape="circle" image="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=85" eyebrow="03 / The ritual" title="Bath House" detail="Water, warmth, stillness" />
            <ImageCard className="wide-card" image="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=85" eyebrow="04 / The coast" title="Beach Residences" detail="Barefoot, from sunrise to blue hour" />
          </div>
        </section>

        <section className="services-section" id="experiences">
          <div className="section-heading"><div><p className="section-kicker">03 / The service</p><h2>Everything<br /><em>in its time.</em></h2></div><p className="section-note">A small team with a long memory. Tell us what you need, or let us anticipate it.</p></div>
          <div className="service-grid">
            {[
              ['01', 'The arrival', 'Private transfer, cold towel, a considered first drink. Your stay starts before you step inside.', Compass],
              ['02', 'The table', 'Produce-led menus prepared in the villa, at the beach, or wherever the evening takes you.', Sparkles],
              ['03', 'The ritual', 'A morning swim, a late massage, a boat out to sea. Days shaped around your own rhythm.', MoveUpRight],
            ].map(([number, title, body, Icon]) => {
              const ServiceIcon = Icon as React.ComponentType<{ size?: number; strokeWidth?: number }>;
              return <article className="service-card" key={title as string}><div className="service-icon"><ServiceIcon size={23} strokeWidth={1.4} /></div><span className="grid-number">{number as string}</span><h3>{title as string}</h3><p>{body as string}</p><a href="#contact" className="service-link">Discover <ArrowUpRight size={15} /></a></article>;
            })}
          </div>
        </section>
      </main>

      <footer className="home-footer" id="contact">
        <div className="footer-brand"><span className="section-kicker">A FLOATING STATE OF MIND</span><h2>Come away<br /><em>with us.</em></h2><a href="mailto:stay@floatresort.com" className="footer-email">stay@floatresort.com <ArrowUpRight size={16} /></a></div>
        <div className="footer-column"><span className="footer-label">Explore</span><a href="#about">Our philosophy</a><a href="#villas">The collection</a><a href="#experiences">Experiences</a></div>
        <div className="footer-column"><span className="footer-label">Find us</span><p><MapPin size={15} /> Jalan Pantai No. 88<br />Bali, Indonesia</p><p><Phone size={15} /> +62 812 3456 7890</p><p><Mail size={15} /> stay@floatresort.com</p></div>
        <div className="footer-bottom"><span>© 2026 Float Resort</span><span>Designed for the unhurried</span><a href="#top">Back to top ↑</a></div>
      </footer>
    </div>
  );
};
