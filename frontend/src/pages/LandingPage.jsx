import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

/* ─── Tiny hook: observe when element enters viewport ─── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.15, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SVG icons (inline, no external dep) ─── */
const Icon = {
  Receipt: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 9.414V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Chain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Scan: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-9C12.75 3.504 13.254 3 13.875 3h2.25C16.746 3 17.25 3.504 17.25 4.125v15.75C17.25 20.496 16.746 21 16.125 21h-2.25a1.125 1.125 0 01-1.125-1.125V4.125zm-9.75 9C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  GitHub: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

/* ─── Reusable Placeholder image block ─── */
function Placeholder({ text, aspect = 'aspect-video', className = '' }) {
  return (
    <div
      className={`${aspect} ${className} rounded-xl border border-dashed border-cyan-400/20 bg-gray-900/60 flex flex-col items-center justify-center gap-2`}
    >
      {/* Replace with actual screenshot */}
      <div className="w-8 h-8 rounded-full border-2 border-dashed border-cyan-400/30 flex items-center justify-center">
        <span className="text-cyan-400/40 text-lg">+</span>
      </div>
      <p className="text-gray-600 text-xs text-center px-4">{text}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════ */
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,240,255,0.08)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1.5 group">
          <span className="text-xl font-bold tracking-tighter text-white group-hover:text-brand-accent transition-colors">
            Board<span className="text-brand-accent">Pay</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[['features', 'Features'], ['how-it-works', 'How It Works'], ['signup', 'Sign Up']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-gray-400 hover:text-brand-accent transition-colors font-medium"
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-brand-accent border border-brand-accent/40 px-4 py-1.5 rounded-lg hover:bg-brand-accent/10 transition-all"
          >
            Sign In
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <Icon.X /> : <Icon.Menu />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950/98 border-t border-gray-800 px-5 pb-5 pt-3 space-y-3">
          {[['features', 'Features'], ['how-it-works', 'How It Works'], ['signup', 'Sign Up']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left text-sm text-gray-300 hover:text-brand-accent py-2 transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate('/login')}
            className="w-full text-sm font-semibold text-black bg-brand-accent px-4 py-2 rounded-lg hover:brightness-110 transition-all mt-2"
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════ */
function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-5 sm:px-8 pt-24 pb-20 overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #00f0ff 0%, transparent 70%)' }}
        />
        {/* Animated grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,240,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.6) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-7 tracking-wider uppercase"
          style={{
            background: 'rgba(0,240,255,0.08)',
            border: '1px solid rgba(0,240,255,0.2)',
            color: '#00f0ff',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
          Now in Early Access — Zambia
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-6 max-w-4xl">
          Transparent Rent.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #0ea5e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Immutable Trust.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl">
          The hybrid ledger that bridges mobile money, manual receipts, and blockchain security
          — all in one elegant platform.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => scrollTo('signup')}
            className="inline-flex items-center gap-2 btn-cyan px-7 py-3 text-sm font-semibold"
          >
            Get Early Access <Icon.Arrow />
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-gray-300 border border-gray-700 rounded-lg hover:border-gray-500 hover:text-white transition-all"
          >
            See How It Works
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-6 mt-10">
          {['JWT-secured', 'On-chain audit trail', 'OCR verified', 'GDPR-ready'].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 text-gray-500 text-xs">
              <span className="text-brand-accent"><Icon.Check /></span>
              {badge}
            </div>
          ))}
        </div>

        {/* Hero dashboard showcase mockup */}
        <div className="mt-14 relative">
          {/* Glow under image */}
          <div
            className="absolute -inset-1 rounded-2xl opacity-40"
            style={{ background: 'linear-gradient(135deg, #00f0ff44, transparent)', filter: 'blur(30px)' }}
          />
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(0,240,255,0.2)' }}
          >
            {/* Dashboard mockup showcase */}
            <div className="w-full h-auto bg-gradient-to-br from-gray-900 via-gray-950 to-black">
              <img
                src="/boardPay(iii).png"
                alt="BoardPay Dashboard Preview"
                className="w-full h-auto object-cover rounded-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════ */
const FEATURES = [
  {
    Icon: Icon.Receipt,
    title: 'Upload & Verify Receipts',
    desc: 'Students snap a photo. Caretakers approve in seconds with a split-screen comparison view — no printing, no chasing.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-t63sccEtbh6GmpliZEb1Pwo97XEBFm.png',
  },
  {
    Icon: Icon.Chain,
    title: 'Immutable Audit Trail',
    desc: 'Every verified payment is hashed and permanently recorded on-chain. Disputes become a thing of the past.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dfLBMyQXhB01UelGgjsSVjZoQapmBs.png',
  },
  {
    Icon: Icon.Scan,
    title: 'Smart OCR Validation',
    desc: 'Our AI automatically reads the receipt text and checks if it matches the declared reference and amount. Zero manual cross-checking.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0exZCwDmjlNyyECD67Mj0xzesm0dO3.png',
  },
  {
    Icon: Icon.Chart,
    title: 'Landlord Analytics',
    desc: 'Revenue trends, occupancy rates, and pending verifications — surfaced in real-time on a clean, minimal dashboard.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ls0FsxxJWMd6FUzXnDrDAgxkkrc2Pd.png',
  },
];

function Features() {
  return (
    <section id="features" className="py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <p className="text-brand-accent text-xs font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">
            Built for Modern Landlords
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mb-16">
            Everything a boarding house needs to run transparently, from first upload to on-chain record.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <div
                className="glass-card p-6 h-full flex flex-col gap-5 group hover:border-brand-accent/25 transition-all duration-300 overflow-hidden"
                style={{ borderRadius: '1rem' }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform duration-300"
                    style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.15)' }}
                  >
                    <f.Icon />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
                {/* Feature showcase image */}
                <div className="mt-auto rounded-lg overflow-hidden border border-white/10">
                  <img 
                    src={f.image} 
                    alt={f.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════ */
const STEPS = [
  {
    num: '01',
    role: 'Student',
    title: 'Upload your receipt',
    desc: 'Log in, enter your lease ID, amount, and transaction reference, then snap or upload your mobile money receipt.',
    color: '#00f0ff',
  },
  {
    num: '02',
    role: 'Caretaker',
    title: 'Verify in seconds',
    desc: 'Open the caretaker portal. The receipt image and payment details appear side-by-side. OCR flags any mismatches. Approve or reject with a keystroke.',
    color: '#0ea5e9',
  },
  {
    num: '03',
    role: 'Landlord',
    title: 'Monitor everything live',
    desc: 'Revenue charts, occupancy graphs, and pending verifications update the moment a payment is approved. Full visibility, zero spreadsheets.',
    color: '#6366f1',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-5 sm:px-8 relative">
      {/* Subtle section divider glow */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px opacity-30"
        style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }}
      />

      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="text-brand-accent text-xs font-semibold uppercase tracking-widest mb-3">Process</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">Three Simple Steps</h2>
          <p className="text-gray-400 text-lg mb-16 max-w-lg">
            From a photo on a phone to an immutable on-chain record — in under two minutes.
          </p>
        </FadeIn>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-[23px] top-10 bottom-10 w-px hidden sm:block"
            style={{ background: 'linear-gradient(180deg, #00f0ff44, #6366f144)' }}
          />

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.12}>
                <div className="flex gap-6 items-start">
                  {/* Number bubble */}
                  <div
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold relative z-10"
                    style={{
                      background: `${step.color}14`,
                      border: `1px solid ${step.color}40`,
                      color: step.color,
                      boxShadow: `0 0 20px ${step.color}20`,
                    }}
                  >
                    {step.num}
                  </div>

                  {/* Content */}
                  <div className="glass-card flex-1 p-6" style={{ borderRadius: '1rem' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${step.color}14`, color: step.color, border: `1px solid ${step.color}30` }}
                      >
                        {step.role}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Workflow illustration: Three Simple Steps */}
        <FadeIn delay={0.3}>
          <div className="mt-16 rounded-2xl overflow-hidden border border-white/10">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9SRDAYKxb46bLMImG7JciUIKac5HEs.png"
              alt="Three Simple Steps - Upload Receipt, Verify in Seconds, Monitor Everything Live"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SIGN-UP
═══════════════════════════════════════════════ */
function SignUp() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required.';
    if (!form.email.includes('@')) e.email = 'Enter a valid email.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      const data = err?.response?.data || {};
      const mapped = {};
      if (data.username) mapped.username = Array.isArray(data.username) ? data.username[0] : data.username;
      if (data.email) mapped.email = Array.isArray(data.email) ? data.email[0] : data.email;
      if (data.password) mapped.password = Array.isArray(data.password) ? data.password[0] : data.password;
      if (data.detail) mapped._global = data.detail;
      if (!Object.keys(mapped).length) mapped._global = 'Registration failed. Please try again.';
      setErrors(mapped);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signup" className="py-28 px-5 sm:px-8 relative">
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px opacity-30"
        style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }}
      />

      <div className="max-w-md mx-auto">
        <FadeIn>
          <p className="text-brand-accent text-xs font-semibold uppercase tracking-widest mb-3 text-center">Get Started</p>
          <h2 className="text-4xl font-bold tracking-tighter mb-2 text-center">Start Managing Smarter</h2>
          <p className="text-gray-400 text-sm text-center mb-10">
            Create your student account. Landlord and caretaker accounts are set up via the admin panel.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-card p-8" style={{ borderRadius: '1.25rem' }}>
            {success ? (
              <div className="text-center py-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-accent"
                  style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)' }}
                >
                  <Icon.Check />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Account created!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  You're on the list. Head to sign in to access your student portal.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-cyan w-full py-2.5 text-sm font-semibold"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {errors._global && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {errors._global}
                  </div>
                )}

                <Field
                  label="Username"
                  type="text"
                  value={form.username}
                  onChange={handleChange('username')}
                  placeholder="john_banda"
                  error={errors.username}
                  disabled={loading}
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="john@example.com"
                  error={errors.email}
                  disabled={loading}
                />
                <Field
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 8 characters"
                  error={errors.password}
                  disabled={loading}
                />
                <Field
                  label="Confirm Password"
                  type="password"
                  value={form.confirm}
                  onChange={handleChange('confirm')}
                  placeholder="Repeat password"
                  error={errors.confirm}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-cyan w-full py-3 text-sm font-semibold mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : 'Create Account'}
                </button>

                <p className="text-center text-gray-600 text-xs pt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-brand-accent hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Field({ label, type, value, onChange, placeholder, error, disabled }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-dark ${error ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
        autoComplete={type === 'password' ? 'new-password' : undefined}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer
      className="border-t px-5 sm:px-8 py-12"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="max-w-xs">
            <span className="text-xl font-bold tracking-tighter">
              Board<span className="text-brand-accent">Pay</span>
            </span>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Hybrid boarding house payment management. Web2 simplicity, Web3 permanence.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-4">
              {[Icon.Twitter, Icon.GitHub, Icon.LinkedIn].map((SocialIcon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-accent hover:bg-brand-accent/10 transition-all"
                  aria-label="Social link placeholder"
                >
                  <SocialIcon />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-sm">
            <div>
              <p className="text-gray-500 font-medium mb-3 text-xs uppercase tracking-wide">Product</p>
              <div className="space-y-2">
                {['Features', 'How It Works', 'Pricing'].map((l) => (
                  <button
                    key={l}
                    onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}
                    className="block text-gray-400 hover:text-brand-accent transition-colors"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-3 text-xs uppercase tracking-wide">Legal</p>
              <div className="space-y-2">
                {['Privacy', 'Terms', 'Contact'].map((l) => (
                  <button key={l} className="block text-gray-400 hover:text-brand-accent transition-colors">
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-gray-600 text-xs">© 2026 BoardPay. All rights reserved.</p>
          <p className="text-gray-700 text-xs">Built with React + Django + On-chain trust</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SignUp />
      <Footer />
    </div>
  );
}
