import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import { useFCM } from './hooks/useFCM'
import { autoSeedIfEmpty } from './lib/autoSeed'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Feed from './pages/Home'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import PostTask from './pages/tasks/PostTask'
import TaskDetail from './pages/tasks/TaskDetail'
import MyTasks from './pages/tasks/MyTasks'
import MyBids from './pages/tasks/MyBids'
import Profile from './pages/profile/Profile'
import Wallet from './pages/wallet/Wallet'
import Messages from './pages/messages/Messages'
import Chat from './pages/messages/Chat'
import Notifications from './pages/Notifications'
import Referrals from './pages/referrals/Referrals'
import Analytics from './pages/analytics/Analytics'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
  return user ? children : <Navigate to="/auth" />
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  useFCM()

  useEffect(() => { init() }, [init])
  useEffect(() => { autoSeedIfEmpty() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/feed" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/feed" /> : <SignUp />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/tasks/new" element={<PostTask />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/my-bids" element={<MyBids />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<Chat />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}
