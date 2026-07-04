import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, ClipboardList, PlusCircle, MessageSquare, Wallet, LogOut, User, Bell, Sun, Moon, Gift, Globe, BarChart3 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useDarkMode from '../store/darkModeStore'
import useLanguage from '../store/languageStore'
import ChatBot from './ChatBot'
import { useFirestoreRealtime } from '../hooks/useFirestore'
import { where } from 'firebase/firestore'

const navItems = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/tasks/new', icon: PlusCircle, label: 'Post' },
  { to: '/my-tasks', icon: ClipboardList, label: 'My Tasks' },
  { to: '/messages', icon: MessageSquare, label: 'Chat' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
]

export default function Layout() {
  const { user, profile, logout } = useAuthStore()
  const { dark, toggle } = useDarkMode()
  const { lang, setLang } = useLanguage()
  const navigate = useNavigate()

  const { data: notifications } = useFirestoreRealtime('notifications', [
    where('userId', '==', user?.uid || '__none__')
  ])

  const unreadCount = notifications?.filter(n => !n.read)?.length || 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      <header className="border-b sticky top-0 z-40" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/feed" className="flex items-center gap-2 font-bold text-xl text-primary">
            <img src="/favicon.svg" alt="" className="w-7 h-7" />
            My Proxy
          </NavLink>
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>{profile?.name || user?.email}</span>
            <button
              onClick={toggle}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title={lang === 'en' ? 'বাংলা' : 'English'}
            >
              <Globe size={20} />
              <span className="text-[10px] font-bold absolute -bottom-0.5 -right-0.5">{lang === 'en' ? 'BN' : 'EN'}</span>
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full relative transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/referrals')}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Invite Friends"
            >
              <Gift size={20} />
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Analytics"
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => navigate(`/profile/${user?.uid}`)}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User size={20} />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pb-20 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
        <div className="max-w-4xl mx-auto flex justify-around">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 text-xs transition-colors ${isActive ? 'text-primary font-semibold' : ''}`
              }
              style={({ isActive }) => !isActive ? { color: 'var(--text-muted)' } : {}}
            >
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <ChatBot />
    </div>
  )
}
