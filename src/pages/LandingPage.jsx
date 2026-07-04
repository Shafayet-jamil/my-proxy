import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useDarkMode from '../store/darkModeStore'
import { ArrowRight, Zap, DollarSign, Shield, Star, Users, CheckCircle, Clock, ChevronRight, Package, Camera, FileText, ShoppingBag, Truck, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useFirestoreRealtime } from '../hooks/useFirestore'

const features = [
  {
    icon: Zap,
    title: 'Post in Seconds',
    desc: 'Describe your task, set a budget, and post it instantly. It takes less than a minute to get started.',
    color: 'bg-violet-100 text-violet-600',
    darkColor: 'dark:bg-violet-900/30 dark:text-violet-400'
  },
  {
    icon: Users,
    title: 'Get Matched Locally',
    desc: 'People in your area see your task and bid to help. Choose the best fit for your needs.',
    color: 'bg-emerald-100 text-emerald-600',
    darkColor: 'dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  {
    icon: DollarSign,
    title: 'Pay Securely',
    desc: 'Set your budget, approve the work, and release payment. Simple, transparent, no hidden fees.',
    color: 'bg-amber-100 text-amber-600',
    darkColor: 'dark:bg-amber-900/30 dark:text-amber-400'
  },
  {
    icon: Shield,
    title: 'Trusted Community',
    desc: 'Both sides rate each other after every task. Build your reputation over time.',
    color: 'bg-sky-100 text-sky-600',
    darkColor: 'dark:bg-sky-900/30 dark:text-sky-400'
  },
  {
    icon: Clock,
    title: 'Fast turnaround',
    desc: 'Urgent tasks get picked up fast. Get your errands done within hours, not days.',
    color: 'bg-rose-100 text-rose-600',
    darkColor: 'dark:bg-rose-900/30 dark:text-rose-400'
  },
  {
    icon: Star,
    title: 'Earn on Your Schedule',
    desc: 'Have free time? Browse tasks, pick what suits you, and earn money on your own terms.',
    color: 'bg-orange-100 text-orange-600',
    darkColor: 'dark:bg-orange-900/30 dark:text-orange-400'
  }
]

const steps = [
  {
    num: '01',
    title: 'Post Your Task',
    desc: 'Write what you need done, add your location, set a budget, and hit publish.',
    icon: Package,
    color: 'from-violet-500 to-indigo-600'
  },
  {
    num: '02',
    title: 'Get Bids',
    desc: 'People nearby see your task and send you proposals. Review their profiles and ratings.',
    icon: Users,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    num: '03',
    title: 'Done & Reviewed',
    desc: 'Task completed, payment released, both sides leave a review. Everyone wins.',
    icon: CheckCircle,
    color: 'from-amber-500 to-orange-600'
  }
]

const iconMap = { Truck, Camera, FileText, ShoppingBag, Package, Sparkles: Zap, Move: Package, Wrench: Zap, BookOpen: Zap, PawPrint: Zap, Flower2: Zap, MoreHorizontal: Zap }

const fallbackCategories = [
  { icon: Truck, name: 'Delivery', desc: 'Pick up & drop off' },
  { icon: Camera, name: 'Photography', desc: 'Capture moments' },
  { icon: FileText, name: 'Documents', desc: 'Submit & file' },
  { icon: ShoppingBag, name: 'Shopping', desc: 'Run errands' },
]

const testimonials = [
  { name: 'Sarah K.', role: 'Task Poster', text: 'I needed a package delivered urgently and got it done in 2 hours. Amazing!', rating: 5 },
  { name: 'Ahmed R.', role: 'Tasker', text: 'I earn extra income doing tasks in my neighborhood. Flexible and fun.', rating: 5 },
  { name: 'Maria L.', role: 'Task Poster', text: 'The bidding system lets me negotiate fair prices. Love the transparency.', rating: 5 },
]

export default function LandingPage() {
  const user = useAuthStore(s => s.user)
  const { dark } = useDarkMode()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: dbCategories } = useFirestoreRealtime('categories', [])
  const taskCategories = dbCategories?.filter(c => c.active !== false).slice(0, 4).map(c => ({
    icon: iconMap[c.icon] || Package,
    name: c.name,
    desc: c.description
  })) || fallbackCategories

  const bg = dark ? 'var(--bg-primary)' : '#ffffff'
  const bgSecondary = dark ? 'var(--bg-secondary)' : '#f9fafb'
  const bgCard = dark ? 'var(--bg-card)' : '#ffffff'
  const textPrimary = dark ? 'var(--text-primary)' : '#111827'
  const textSecondary = dark ? 'var(--text-secondary)' : '#4b5563'
  const textMuted = dark ? 'var(--text-muted)' : '#6b7280'
  const borderColor = dark ? 'var(--border-color)' : '#e5e7eb'
  const navBg = dark ? 'rgba(17,24,39,0.8)' : 'rgba(255,255,255,0.8)'

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: textPrimary }}>
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-lg border-b z-50" style={{ backgroundColor: navBg, borderColor: borderColor }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="w-8 h-8" />
            <span className="text-xl font-bold" style={{ color: textPrimary }}>My<span className="text-primary">Proxy</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm hover:opacity-80 transition-colors" style={{ color: textSecondary }}>How It Works</a>
            <a href="#features" className="text-sm hover:opacity-80 transition-colors" style={{ color: textSecondary }}>Features</a>
            <a href="#categories" className="text-sm hover:opacity-80 transition-colors" style={{ color: textSecondary }}>Categories</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/feed" className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors">
                Go to App
              </Link>
            ) : (
              <>
                <Link to="/auth" className="px-4 py-2 text-sm font-medium hover:opacity-80 transition-colors" style={{ color: textSecondary }}>Log In</Link>
                <Link to="/signup" className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors">Sign Up Free</Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: textPrimary }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t px-4 pb-4 pt-2 space-y-2" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <a href="#how" className="block py-2" style={{ color: textSecondary }} onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#features" className="block py-2" style={{ color: textSecondary }} onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#categories" className="block py-2" style={{ color: textSecondary }} onClick={() => setMobileOpen(false)}>Categories</a>
            <hr style={{ borderColor: borderColor }} />
            {user ? (
              <Link to="/feed" className="block w-full text-center py-2.5 bg-primary text-white rounded-lg font-medium">Go to App</Link>
            ) : (
              <>
                <Link to="/auth" className="block w-full text-center py-2.5 border rounded-lg font-medium" style={{ borderColor: borderColor, color: textSecondary }}>Log In</Link>
                <Link to="/signup" className="block w-full text-center py-2.5 bg-primary text-white rounded-lg font-medium">Sign Up Free</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: dark ? 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(16,185,129,0.05))' : 'linear-gradient(135deg, #eef2ff, #ffffff, #ecfdf5)' }} />
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8">
            <Zap size={14} /> Get things done, faster
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto" style={{ color: textPrimary }}>
            Your neighbor is your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">next helper</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: textSecondary }}>
            Post small urgent tasks. Get bids from people nearby. Pay only when satisfied. My Proxy connects your neighborhood to get things done.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/feed' : '/signup'}
              className="group px-8 py-4 bg-primary text-white text-base font-semibold rounded-full hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2"
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how"
              className="px-8 py-4 text-base font-semibold rounded-full border flex items-center gap-2 transition-all"
              style={{ color: textSecondary, borderColor: borderColor, backgroundColor: bgCard }}
            >
              See How It Works
              <ChevronRight size={18} />
            </a>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm" style={{ color: textMuted }}>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary" /> Free to join</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary" /> No commission</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary" /> Safe & rated</div>
          </div>
        </div>
      </section>

      <section id="how" className="py-20 px-4" style={{ backgroundColor: bg }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: textPrimary }}>How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <step.icon size={24} />
                </div>
                <div className="text-xs font-bold mb-2" style={{ color: textMuted }}>{step.num}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: textPrimary }}>{step.title}</h3>
                <p className="leading-relaxed" style={{ color: textSecondary }}>{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 left-[calc(100%-1rem)] w-[calc(100%-2rem)] h-px" style={{ background: dark ? 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' : 'linear-gradient(to right, #e5e7eb, transparent)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4" style={{ backgroundColor: bgSecondary }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: textPrimary }}>Built for Your Neighborhood</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="rounded-2xl p-6 hover:shadow-lg transition-all border group hover:-translate-y-1" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
                <div className={`w-12 h-12 rounded-xl ${f.color} ${f.darkColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: textPrimary }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="py-20 px-4" style={{ backgroundColor: bg }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Popular Categories</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: textPrimary }}>Tasks People Are Posting</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {taskCategories.map((cat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl border hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer group" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <cat.icon size={24} className="text-primary group-hover:text-white" />
                </div>
                <h3 className="font-bold mb-1" style={{ color: textPrimary }}>{cat.name}</h3>
                <p className="text-sm" style={{ color: textMuted }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ backgroundColor: bgSecondary }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: textPrimary }}>Loved by Thousands</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl p-6 border hover:shadow-lg transition-all" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#fbbf24" stroke="#fbbf24" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed" style={{ color: textSecondary }}>"{t.text}"</p>
                <div>
                  <p className="font-bold" style={{ color: textPrimary }}>{t.name}</p>
                  <p className="text-sm" style={{ color: textMuted }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ backgroundColor: bg }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of people in your neighborhood who are already getting things done with My Proxy.
              </p>
              <Link
                to={user ? '/feed' : '/signup'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary text-base font-semibold rounded-full hover:bg-gray-50 transition-all shadow-lg"
              >
                {user ? 'Go to Dashboard' : 'Join My Proxy Free'}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4" style={{ backgroundColor: dark ? '#111827' : '#1f2937' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/favicon.svg" alt="" className="w-8 h-8" />
                <span className="text-xl font-bold text-white">My<span className="text-primary-light">Proxy</span></span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">Your neighborhood task marketplace. Get things done, earn money, build community.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#how" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">Categories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} My Proxy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
