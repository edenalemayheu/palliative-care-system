import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/lib/config';
import { useTheme } from '@/context/ThemeContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-lowest/90 backdrop-blur-md border-b border-border-base shadow-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm group-hover:shadow-md transition-shadow">
            <Heart size={18} className="text-white" />
          </div>
          <span className="text-base font-bold text-on-surface">{APP_NAME}</span>
        </Link>

        {/* Nav actions */}
        <nav className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-all"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate('/register')}>
            Register as Staff
          </Button>
        </nav>
      </div>
    </header>
  );
};
