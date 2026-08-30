import React from 'react';
import { Heart } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export const Footer: React.FC = () => (
  <footer className="border-t border-border-base bg-surface-lowest py-8 mt-16">
    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <Heart size={14} className="text-primary" />
        <span>
          © {new Date().getFullYear()} {APP_NAME} — Yekatit 12 Hospital Medical College
        </span>
      </div>
      <p className="text-xs text-text-muted">
        Built with clinical teams · Privacy-first records
      </p>
    </div>
  </footer>
);
