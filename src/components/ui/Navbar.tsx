import React from 'react';
import { ArrowUpRight, Menu } from 'lucide-react';

interface NavbarProps {
  currentView: 'canvas' | 'list' | 'staff' | 'home';
  onSwitchView: (view: 'canvas' | 'list' | 'staff' | 'home') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenQuickBook: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onSwitchView }) => {
  const navigate = (view: 'canvas' | 'list' | 'staff' | 'home') => (event: React.MouseEvent) => {
    event.preventDefault();
    onSwitchView(view);
  };

  return (
    <header className="site-nav">
      <a href="#top" className="brand-mark" onClick={navigate('home')}><span>F</span> FLOAT <small>/ RESORT</small></a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#about">Manifesto</a>
        <a href="#villas" onClick={navigate('list')}>Residences</a>
        <a href="#experiences">Experiences</a>
        {currentView !== 'staff' && <a href="#staff" onClick={navigate('staff')}>Staff</a>}
      </nav>
      <a href="#contact" className="nav-contact">Make an enquiry <ArrowUpRight size={15} /></a>
      <button className="mobile-menu" aria-label="Open menu"><Menu size={20} /></button>
    </header>
  );
};
