import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { ArrowRight, Zap, DollarSign, Shield, Star, Users, CheckCircle, Clock, ChevronRight, Package, Camera, FileText, ShoppingBag, Truck, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useFirestoreRealtime } from '../hooks/useFirestore'

const features = [
  {
    icon: Zap,
    title: 'Post in Seconds',
    desc: 'Describe your task, set a budget, and post it instantly. It takes less than a minute to get started.',
    color: 'bg-violet-100 text-violet-600'
  },
  {
    icon: Users,
    title: 'Get Matched Locally',
    desc: 'People in your area see your task and bid to help. Choose the best fit for your needs.',
    color: 'bg-emerald-100 text-emerald-600'
  },
  {
    icon: DollarSign,
    title: 'Pay Securely',
    desc: 'Set your budget, approve the work, and release payment. Simple, transparent, no hidden fees.',
    color: 'bg-amber-100 text-amber-600'
  },
  {
    icon: Shield,
    title: 'Trusted Community',
    desc: 'Both sides rate each other after every task. Build your reputation over time.',
    color: 'bg-sky-100 text-sky-600'
  },
  {
    icon: Clock,
    title: 'Fast turnaround',
    desc: 'Urgent tasks get picked up fast. Get your errands done within hours, not days.',
    color: 'bg-rose-100 text-rose-600'
  },
  {
    icon: Star,
    title: 'Earn on Your Schedule',
    desc: 'Have free time? Browse tasks, pick what suits you, and earn money on your own terms.',
    color: 'bg-orange-100 text-orange-600'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: dbCategories } = useFirestoreRealtime('categories', [])
  const taskCategories = dbCategories?.filter(c => c.active !== false).slice(0, 4).map(c => ({
    icon: iconMap[c.icon] || Package,
    name: c.name,
    desc: c.description
  })) || fallbackCategories

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">My<span className="text-primary">Proxy</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#categories" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Categories</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/feed" className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors">
                Go to App
              </Link>
            ) : (
              <>
                <Link to="/auth" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Log In</Link>
                <Link to="/signup" className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors">Sign Up Free</Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t bg-white px-4 pb-4 pt-2 space-y-2">
            <a href="#how" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#features" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#categories" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Categories</a>
            <hr />
            {user ? (
              <Link to="/feed" className="block w-full text-center py-2.5 bg-primary text-white rounded-lg font-medium">Go to App</Link>
            ) : (
              <>
                <Link to="/auth" className="block w-full text-center py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">Log In</Link>
                <Link to="/signup" className="block w-full text-center py-2.5 bg-primary text-white rounded-lg font-medium">Sign Up Free</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8">
            <Zap size={14} /> Get things done, faster
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
            Your neighbor is your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">next helper</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
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
              className="px-8 py-4 bg-white text-gray-700 text-base font-semibold rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              See How It Works
              <ChevronRight size={18} />
            </a>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary" /> Free to join</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary" /> No commission</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-secondary" /> Safe & rated</div>
          </div>
        </div>
      </section>

      <section id="how" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <step.icon size={24} />
                </div>
                <div className="text-xs font-bold text-gray-300 mb-2">{step.num}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 left-[calc(100%-1rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-gray-200 to-transparent -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Built for Your Neighborhood</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 group hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Popular Categories</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Tasks People Are Posting</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {taskCategories.map((cat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <cat.icon size={24} className="text-primary group-hover:text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by Thousands</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#fbbf24" stroke="#fbbf24" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
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

      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/favicon.svg" alt="" className="w-8 h-8" />
                <span className="text-xl font-bold text-white">My<span className="text-primary-light">Proxy</span></span>
              </div>
              <p className="text-sm leading-relaxed">Your neighborhood task marketplace. Get things done, earn money, build community.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">Categories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} My Proxy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
