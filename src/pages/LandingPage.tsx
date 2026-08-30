import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Home, Activity, Users, ClipboardList, ArrowRight, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// Heartbeat SVG
const HeartbeatLine: React.FC = () => (
  <svg viewBox="0 0 300 60" className="w-full h-16 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <motion.polyline
      points="0,30 40,30 55,10 70,50 85,5 100,55 115,30 160,30 175,20 190,40 205,30 300,30"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    />
  </svg>
);

// Stats card
const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-primary">{value}</p>
    <p className="text-xs text-text-muted mt-0.5">{label}</p>
  </div>
);

// Feature card
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-surface-lowest rounded-xl border border-border-base shadow-card p-6 hover:shadow-card-hover transition-shadow"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-on-surface mb-1.5">{title}</h3>
    <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
  </motion.div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light px-3 py-1 text-xs font-semibold text-primary mb-6">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary status-pulse" />
                PALLIATIVE PATIENT MONITORING SYSTEM
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold text-on-surface leading-tight tracking-tight mb-5">
                Compassionate Care,{' '}
                <span className="text-primary">Coordinated Support</span>
              </h1>

              <p className="text-base text-text-secondary leading-relaxed mb-8 max-w-lg">
                A comprehensive platform for palliative care teams to monitor patients, coordinate home visits,
                manage medications, and ensure holistic end-of-life care.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Button size="lg" onClick={() => navigate('/login')} rightIcon={<ArrowRight size={16} />}>
                  Sign In
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                  Register as Staff
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-5 text-xs text-text-muted">
                {['Built with clinical teams', 'Home-visit ready', 'Privacy-first records'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <Shield size={12} className="text-primary" />
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right – vitals card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:block"
            >
              <div className="bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-7">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Patient Vitals</p>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                    <span className="flex h-2 w-2 rounded-full bg-success status-pulse" />
                    STABLE
                  </span>
                </div>
                <HeartbeatLine />
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border-base pt-5">
                  <StatItem value="98%" label="SpO₂" />
                  <StatItem value="72" label="Pulse bpm" />
                  <StatItem value="36.8°" label="Temp °C" />
                </div>
                <div className="mt-5 rounded-xl bg-primary-light p-4">
                  <div className="flex items-start gap-3">
                    <Heart size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-primary/80 leading-relaxed">
                      Every visit, every vital, in one thread. Care teams log observations at each home visit
                      so a patient's story stays continuous — not scattered across paper charts.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-surface-lowest border-y border-border-base py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem value="12+" label="Active Patients" />
          <StatItem value="100%" label="Digitised Records" />
          <StatItem value="3 Roles" label="Team Leaders, Physicians, Nurses" />
          <StatItem value="Y12HMC" label="Yekatit 12 Hospital" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-on-surface mb-3">Everything your care team needs</h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm">
              From home visit checklists to referral approvals — every clinical workflow in one place.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={<Home size={20} />} title="Home Visit Checklists" desc="Comprehensive 15-section digital visit forms matching the Y12HMC physical checklist — vitals, pain, ADL, red flags, and more." />
            <FeatureCard icon={<Activity size={20} />} title="KPS/PPS Progress Tracking" desc="Visualise patient functional decline over time with auto-calculated trend lines and clinician alerts." />
            <FeatureCard icon={<Users size={20} />} title="Care Team Coordination" desc="Team leaders, physicians, and nurses each have role-specific views and approval workflows." />
            <FeatureCard icon={<ClipboardList size={20} />} title="Medication & Lab Orders" desc="Order medications and lab tests at home or hospital, track status, and enter results electronically." />
            <FeatureCard icon={<GitBranch size={20} />} title="Referral Management" desc="Staff request referrals; admins approve or decline. Patient location updates automatically on acceptance." />
            <FeatureCard icon={<Shield size={20} />} title="Secure & Private" desc="Role-based access control, JWT authentication, and email verification before any clinical access." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-2xl mx-auto text-center">
          <Heart size={32} className="text-white/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-primary-light/80 text-sm mb-7">
            Register as a staff member and your administrator will approve your account.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" size="lg" onClick={() => navigate('/register')}>
              Register as Staff
            </Button>
            <Button
              className="border border-white/30 bg-transparent text-white hover:bg-white/10"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
