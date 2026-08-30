import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, GitBranch,
  BarChart3, Settings, Heart, LogOut, Menu, X,
  ChevronRight, Bell, ClipboardList,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/constants';
import { APP_NAME } from '@/lib/config';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  end?: boolean;
}

// ── Stethoscope SVG icon (custom medical motif) ─────────────────
const StethoscopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* earpieces */}
    <path d="M6 3v5" />
    <path d="M10 3v5" />
    {/* headset bridge */}
    <path d="M6 8a4 4 0 0 0 4 4" />
    {/* tubing down */}
    <path d="M10 12v4a4 4 0 0 0 4 4" />
    {/* chest piece circle */}
    <circle cx="18" cy="19" r="2" />
  </svg>
);

// ── Heartbeat line (simple, no labels) ──────────────────────────
const HeartbeatAccent: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 120 20"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="0,10 22,10 30,2 38,18 46,1 54,19 62,10 120,10" />
  </svg>
);

// ── Admin nav items ──────────────────────────────────────────────
const adminNavItems = (pendingStaff = 0, pendingReferrals = 0): NavItem[] => [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} />, end: true },
  { label: 'Patients', href: '/admin/patients', icon: <Users size={18} /> },
  { label: 'Staff Management', href: '/admin/staff', icon: <UserCheck size={18} />, badge: pendingStaff || undefined },
  { label: 'Referrals', href: '/admin/referrals', icon: <GitBranch size={18} />, badge: pendingReferrals || undefined },
  { label: 'Reports', href: '/admin/reports', icon: <BarChart3 size={18} /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
];

// ── Staff nav items ──────────────────────────────────────────────
const staffNavItems = (): NavItem[] => [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { label: 'Patients', href: '/patients', icon: <Users size={18} /> },
  { label: 'Visits', href: '/patients', icon: <ClipboardList size={18} /> },
];

interface SidebarProps {
  pendingStaff?: number;
  pendingReferrals?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ pendingStaff = 0, pendingReferrals = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const isAdmin = user?.type === 'admin';
  const navItems = isAdmin
    ? adminNavItems(pendingStaff, pendingReferrals)
    : staffNavItems();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm flex-shrink-0">
            <Heart size={18} className="text-white animate-heartbeat" />
          </div>
          <span className="text-sm font-bold text-on-surface leading-tight">{APP_NAME}</span>
        </div>
        {/* Medical accent strip: stethoscope + heartbeat line */}
        <div className="flex items-center gap-2 px-1">
          <StethoscopeIcon className="h-4 w-4 flex-shrink-0 text-primary/40" />
          <HeartbeatAccent className="flex-1 h-4 text-primary/25" />
        </div>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href + item.label}
            to={item.href}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-text-muted group-hover:text-on-surface')}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white px-1.5">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight size={14} className="text-primary opacity-60" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User info + logout ── */}
      <div className="border-t border-border-base p-3 mt-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-low transition-colors">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">
              {user?.type === 'admin' ? 'Administrator' : ROLE_LABELS[user?.role || ''] || user?.email}
            </p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex-shrink-0 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-bg transition-all"
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-surface-lowest border-r border-border-base shadow-nav flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-lowest border border-border-base shadow-md text-on-surface"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile: overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-on-surface/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: drawer */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-surface-lowest border-r border-border-base shadow-xl transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:bg-surface-low"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
};

// Notification bell for top bar
export const NotificationBell: React.FC<{ count?: number }> = ({ count = 0 }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/admin')}
      className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-low transition-colors"
      aria-label={`${count} notifications`}
    >
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};
